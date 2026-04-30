const prisma                      = require('../lib/prisma');
const roomService                 = require('./roomService');
const bcrypt                      = require('bcryptjs');
const crypto                      = require('crypto');
const { hashToken }               = require('../lib/auth');
const { sendBookingPendingEmail, sendActivationEmail } = require('../../emails');

const CANCELLATION_WINDOW_HOURS = 24;
const BCRYPT_ROUNDS = 12;
const DEFAULT_GUEST_PASSWORD = 'DrHub@12345';
const ACTIVATION_TOKEN_EXPIRES_HOURS = Number(process.env.ACTIVATION_TOKEN_EXPIRES_HOURS || 24);

function getActivationUrl(rawToken) {
    const baseUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
    const url = new URL('/api/users/activate-account', baseUrl);
    url.searchParams.set('token', rawToken);
    return url.toString();
}

const ALLOWED_STATUS_TRANSITIONS = {
    DRAFT:     ['PENDING', 'CONFIRMED', 'CANCELLED', 'DECLINED'],
    PENDING:   ['CONFIRMED', 'CANCELLED', 'DECLINED'],
    CONFIRMED: ['FULLY_PAID', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'DECLINED'],
    FULLY_PAID: ['CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    CHECKED_IN: ['COMPLETED', 'NO_SHOW'],
    REPORTED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW:   [],
    DECLINED:  []
};

const BOOKING_STATUSES = Object.freeze(Object.keys(ALLOWED_STATUS_TRANSITIONS));
const STATUS_ALIASES = Object.freeze({
    APPROVED: 'CONFIRMED',
    REJECTED: 'DECLINED'
});
const ACTIVE_SLOT_STATUSES = ['DRAFT', 'PENDING', 'CONFIRMED', 'FULLY_PAID', 'REPORTED', 'CHECKED_IN'];

function normalizeBookingStatus(status) {
    if (typeof status !== 'string') return null;
    const normalized = status.trim().toUpperCase();
    return STATUS_ALIASES[normalized] || normalized;
}

function isSlotActiveStatus(status) {
    return ACTIVE_SLOT_STATUSES.includes(status);
}

function generateBookingReference() {
    const date   = new Date();
    const year   = date.getFullYear();
    const month  = String(date.getMonth() + 1).padStart(2, '0');
    const day    = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DRH-${year}${month}${day}-${random}`;
}

function formatAmountKES(amountCents) {
    return (amountCents).toLocaleString('en-KE', {
        style:    'currency',
        currency: 'KES'
    });
}

function sanitizeBooking(booking) {
    return {
        id:            booking.id,
        reference:     booking.reference,
        date:          booking.date,
        slot:          booking.slot,
        status:        booking.status,
        amountCharged: booking.amountCharged,
        depositPaid:  booking.depositPaid,
        amountPaid:   booking.amountPaid,
        notes:         booking.notes || null,
        room: booking.room ? {
            id:   booking.room.id,
            name: booking.room.name
        } : null,
        user: booking.user ? {
            id:    booking.user.id,
            name:  booking.user.name,
            email: booking.user.email,
            role:  booking.user.role
        } : null,
        payments: booking.payment ? {
            id:          booking.payment.id,
            status:      booking.payment.status,
            providerReference: booking.payment.providerReference || null,
            paymentLink: booking.payment.paymentLink || null,
            amount:     booking.payment.amount || null,
        } : null,
        userId:    booking.userId,
        roomId:    booking.roomId,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
    };
}

// Find an existing user by email or create one with MEMBER role.
async function findOrCreateUser({ name, email }) {
    const user = await prisma.user.upsert({
        where:  { email },
        update: { status: 'ACTIVE' },
        create: {
            name,
            email,
            role:   'MEMBER',
            status: 'ACTIVE'
        },
        select: { id: true, name: true, email: true, status: true, role: true }
    });

    return user;
}

async function checkAvailability({ roomId, date, slot, room = null }) {
    const resolvedRoom = room || await roomService.getRoomById(roomId);

    if (!resolvedRoom) {
        return { available: false, roomId, date, slot, reason: 'Room not found' };
    }

    if (!resolvedRoom.is_active) {
        return { available: false, roomId, date, slot, reason: 'Room is not available for booking' };
    }

    const existingBooking = await prisma.booking.findFirst({
        where: {
            roomId,
            date:   new Date(date),
            slot,
            status: { in: ['PENDING', 'CONFIRMED'] }
        }
    });

    if (existingBooking) {
        return { available: false, roomId, date, slot, reason: 'This slot is already booked' };
    }

    return { available: true, roomId, date, slot };
}

async function createBooking({ userId, roomId, slotId, bookingDate, totalCost, numberOfAttendees }) {
    const normalizedDate = new Date(bookingDate);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, status: true }
    });
    if (!user) throw new Error('USER_NOT_FOUND');
    if (!['ACTIVE', 'APPROVED'].includes(user.status)) throw new Error('USER_NOT_ACTIVE');

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    });
    if (!room) throw new Error('ROOM_NOT_FOUND');
    if (!room.isActive) throw new Error('ROOM_INACTIVE');

    const approvedDocument = await prisma.userDocument.findFirst({
        where: { userId: user.id, status: 'APPROVED' }
    });
    if (!approvedDocument) throw new Error('NO_APPROVED_DOCUMENT');

    const slot = await prisma.bookSlot.findFirst({
        where: { id: slotId, roomId }
    });
    if (!slot) throw new Error('SLOT_NOT_FOUND');
    if (slot.blocked) throw new Error('SLOT_BLOCKED');
    if (slot.booked) throw new Error('SLOT_UNAVAILABLE');
    if (slot.slotDate && new Date(slot.slotDate).toDateString() !== normalizedDate.toDateString()) {
        throw new Error('SLOT_DATE_MISMATCH');
    }

    const activeBookingOnSlot = await prisma.booking.findFirst({
        where: { slotId, status: { in: ['PENDING', 'CONFIRMED'] } },
        select: { id: true }
    });
    if (activeBookingOnSlot) throw new Error('SLOT_UNAVAILABLE');

    if (!room.cost) throw new Error('ROOM_COST_NOT_SET');
    if (totalCost !== room.cost) throw new Error('INVALID_TOTAL_COST');

    let reference;
    let referenceIsUnique = false;
    while (!referenceIsUnique) {
        reference = generateBookingReference();
        const existing = await prisma.booking.findUnique({ where: { reference } });
        if (!existing) referenceIsUnique = true;
    }

    let booking;
    try {
        booking = await prisma.$transaction(async (tx) => {
            const createdBooking = await tx.booking.create({
                data: {
                    reference,
                    date: normalizedDate,
                    status: 'DRAFT',
                    amountCharged: totalCost,
                    depositPaid: false,
                    amountPaid: 0,
                    notes: `Self booking. Attendees: ${numberOfAttendees}`,
                    userId: user.id,
                    roomId,
                    slotId
                }
            });

            await tx.bookSlot.update({
                where: { id: slotId },
                data: { booked: true }
            });

            return createdBooking;
        });
    } catch (error) {
        if (error.code === 'P2002') {
            const targets = Array.isArray(error.meta?.target) ? error.meta.target : [String(error.meta?.target || '')];
            if (targets.some((target) => String(target).includes('slotId'))) {
                throw new Error('SLOT_UNAVAILABLE');
            }
        }
        throw error;
    }

    try {
        if (user.email) {
            await sendBookingPendingEmail({
                to: user.email,
                name: user.name || 'Customer',
                reference: booking.reference,
                roomName: room.name,
                date: new Date(booking.date).toDateString(),
                slot: slot.title,
                amountDue: formatAmountKES(booking.amountCharged)
            });
        }
    } catch (emailError) {
        console.error(`[BOOKING] Email notification failed for ${booking.reference}:`, emailError.message);
    }

    return sanitizeBooking(booking);
}

async function createNonUserBooking({
    roomId,
    slotId,
    bookingDate,
    totalCost,
    fullName,
    email,
    phoneNumber,
    numberOfAttendees,
    documents = []
}) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(fullName).trim();
    const normalizedPhone = String(phoneNumber).trim();
    const normalizedDate = new Date(bookingDate);

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    });
    if (!room) throw new Error('ROOM_NOT_FOUND');
    if (!room.isActive) throw new Error('ROOM_INACTIVE');

    const slot = await prisma.bookSlot.findFirst({
        where: {
            id: slotId,
            roomId
        }
    });
    if (!slot) throw new Error('SLOT_NOT_FOUND');
    if (slot.booked) throw new Error('SLOT_UNAVAILABLE');
    if (slot.slotDate && new Date(slot.slotDate).toDateString() !== normalizedDate.toDateString()) {
        throw new Error('SLOT_DATE_MISMATCH');
    }

    const activeBookingOnSlot = await prisma.booking.findFirst({
        where: {
            slotId,
            status: { in: ['PENDING', 'CONFIRMED'] }
        },
        select: { id: true }
    });
    if (activeBookingOnSlot) throw new Error('SLOT_UNAVAILABLE');

    let reference;
    let referenceIsUnique = false;

    while (!referenceIsUnique) {
        reference = generateBookingReference();
        const existing = await prisma.booking.findUnique({ where: { reference } });
        if (!existing) referenceIsUnique = true;
    }

    let booking;
    let createdNewUser = false;
    let activationContext = null;
    try {
        booking = await prisma.$transaction(async (tx) => {
            const existingUserByEmail = await tx.user.findUnique({
                where: { email: normalizedEmail }
            });

            const existingUserByPhone = await tx.user.findUnique({
                where: { phoneNumber: normalizedPhone }
            });

            const existingUser = existingUserByEmail || existingUserByPhone;

            const user = existingUser
                ? await tx.user.update({
                    where: { id: existingUser.id },
                    data: {
                        name: existingUser.name || normalizedName,
                        email: existingUser.email || normalizedEmail,
                        phoneNumber: existingUser.phoneNumber || normalizedPhone
                    },
                    select: { id: true, name: true, email: true, phoneNumber: true }
                })
                : await tx.user.create({
                    data: (() => {
                        createdNewUser = true;
                        const rawActivationToken = crypto.randomBytes(32).toString('hex');
                        activationContext = {
                            rawToken: rawActivationToken
                        };
                        return {
                            name: normalizedName,
                            email: normalizedEmail,
                            phoneNumber: normalizedPhone,
                            role: 'MEMBER',
                            status: 'INACTIVE',
                            passwordHash: bcrypt.hashSync(DEFAULT_GUEST_PASSWORD, BCRYPT_ROUNDS)
                        };
                    })(),
                    select: { id: true, name: true, email: true, phoneNumber: true }
                });

            if (createdNewUser && activationContext?.rawToken) {
                const activationTokenHash = hashToken(activationContext.rawToken);
                const activationExpiresAt = new Date(Date.now() + ACTIVATION_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

                await tx.accountActivationToken.create({
                    data: {
                        tokenHash: activationTokenHash,
                        expiresAt: activationExpiresAt,
                        userId: user.id
                    }
                });
            }

            const createdBooking = await tx.booking.create({
                data: {
                    reference,
                    date: normalizedDate,
                    status: 'PENDING',
                    amountCharged: totalCost,
                    notes: `Guest booking. Attendees: ${numberOfAttendees}`,
                    userId: user.id,
                    roomId,
                    slotId
                },
                include: {
                    room: { select: { id: true, name: true } },
                    user: { select: { id: true, name: true, email: true } },
                    payments: { select: { id: true, status: true, paymentReference: true } }
                }
            });

            if (Array.isArray(documents) && documents.length > 0) {
                const normalizedDocuments = documents
                    .filter((doc) => doc && doc.documentName && doc.documentFile)
                    .map((doc) => ({
                        documentName: String(doc.documentName).trim(),
                        documentFile: String(doc.documentFile).trim(),
                        status: 'PENDING',
                        userId: user.id
                    }));

                if (normalizedDocuments.length > 0) {
                    await tx.userDocument.createMany({
                        data: normalizedDocuments
                    });
                }
            }

            await tx.bookSlot.update({
                where: { id: slotId },
                data: { booked: true }
            });

            return createdBooking;
        });
    } catch (error) {
        if (error.code === 'P2002') {
            const targets = Array.isArray(error.meta?.target)
                ? error.meta.target
                : [String(error.meta?.target || '')];

            if (targets.some((target) => String(target).includes('slotId'))) {
                throw new Error('SLOT_UNAVAILABLE');
            }
            if (targets.some((target) => String(target).includes('phoneNumber'))) {
                throw new Error('PHONE_NUMBER_IN_USE');
            }
        }
        throw error;
    }

    try {
        await sendBookingPendingEmail({
            to: normalizedEmail,
            name: normalizedName,
            reference: booking.reference,
            roomName: room.name,
            date: new Date(booking.date).toDateString(),
            slot: slot.title,
            amountDue: formatAmountKES(booking.amountCharged)
        });
    } catch (emailError) {
        console.error(`[BOOKING] Email notification failed for ${booking.reference}:`, emailError.message);
    }

    if (createdNewUser && activationContext?.rawToken) {
        try {
            const result = await sendActivationEmail({
                to: normalizedEmail,
                name: normalizedName,
                activationUrl: getActivationUrl(activationContext.rawToken)
            });
            if (!result.ok) {
                console.warn(`Activation email skipped: ${result.reason}`);
            }
        } catch (mailError) {
            console.error('Failed to send activation email:', mailError.message);
        }
    }

    return sanitizeBooking(booking);
}

async function createAdminUserBooking({
    roomId,
    slotId,
    userId,
    bookingDate,
    totalCost,
    numberOfAttendees
}) {
    const normalizedDate = new Date(bookingDate);

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    });
    if (!room) throw new Error('ROOM_NOT_FOUND');
    if (!room.isActive) throw new Error('ROOM_INACTIVE');

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, status: true }
    });
    if (!user) throw new Error('USER_NOT_FOUND');
    if (!['ACTIVE', 'APPROVED'].includes(user.status)) throw new Error('USER_NOT_ACTIVE');

    const slot = await prisma.bookSlot.findFirst({
        where: {
            id: slotId,
            roomId
        }
    });
    if (!slot) throw new Error('SLOT_NOT_FOUND');
    if (slot.booked) throw new Error('SLOT_UNAVAILABLE');
    if (slot.slotDate && new Date(slot.slotDate).toDateString() !== normalizedDate.toDateString()) {
        throw new Error('SLOT_DATE_MISMATCH');
    }

    const activeBookingOnSlot = await prisma.booking.findFirst({
        where: {
            slotId,
            status: { in: ['PENDING', 'CONFIRMED'] }
        },
        select: { id: true }
    });
    if (activeBookingOnSlot) throw new Error('SLOT_UNAVAILABLE');

    let reference;
    let referenceIsUnique = false;
    while (!referenceIsUnique) {
        reference = generateBookingReference();
        const existing = await prisma.booking.findUnique({ where: { reference } });
        if (!existing) referenceIsUnique = true;
    }

    let booking;
    try {
        booking = await prisma.$transaction(async (tx) => {
            const createdBooking = await tx.booking.create({
                data: {
                    reference,
                    date: normalizedDate,
                    status: 'DRAFT',
                    amountCharged: totalCost,
                    notes: `Admin booking for user ${user.name}. Attendees: ${numberOfAttendees}`,
                    userId,
                    roomId,
                    slotId
                },
                include: {
                    room: { select: { id: true, name: true } },
                    user: { select: { id: true, name: true, email: true } },
                    payments: { select: { id: true, status: true, paymentReference: true } }
                }
            });

            await tx.bookSlot.update({
                where: { id: slotId },
                data: { booked: true }
            });

            return createdBooking;
        });
    } catch (error) {
        if (error.code === 'P2002') {
            const targets = Array.isArray(error.meta?.target)
                ? error.meta.target
                : [String(error.meta?.target || '')];
            if (targets.some((target) => String(target).includes('slotId'))) {
                throw new Error('SLOT_UNAVAILABLE');
            }
        }
        throw error;
    }

    try {
        if (user.email) {
            await sendBookingPendingEmail({
                to: user.email,
                name: user.name || 'Customer',
                reference: booking.reference,
                roomName: room.name,
                date: new Date(booking.date).toDateString(),
                slot: slot.title,
                amountDue: formatAmountKES(booking.amountCharged)
            });
        }
    } catch (emailError) {
        console.error(`[BOOKING] Email notification failed for ${booking.reference}:`, emailError.message);
    }

    return sanitizeBooking(booking);
}



async function getBookingsByUser(userId) {
    const bookings = await prisma.booking.findMany({
        where:   { userId },
        include: {
            room:    { select: { id: true, name: true } },
            user:    { select: { id: true, name: true, email: true } },
            payments: { select: { id: true, status: true, paymentReference: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return bookings;
}


async function getBookingById(id) {
    const booking = await prisma.booking.findUnique({
        where:   { id },
        include: {
            room:    { select: { id: true, name: true } },
            user:    { select: { id: true, name: true, email: true, role: true } },
            payments: { select: { id: true, status: true, paymentReference: true, paymentType: true, createdAt: true, recordMethod: true, paymentMethod: true, amount: true } },
            slot: { select: { id: true, title: true, slotDate: true, booked: true, blocked: true, fullDay: true } }
        }
    });

    if (!booking) return null;
    return booking;
}

async function getAllBookings({ status, roomId, date } = {}) {
    const where = {};

    if (status) where.status = status;
    if (roomId) where.roomId = roomId;
    if (date)   where.date   = new Date(date);

    const bookings = await prisma.booking.findMany({
        where,
        include: {
            room:    { select: { id: true, name: true } },
            user:    { select: { id: true, name: true, email: true, role: true } },
            slot: { select: { id: true, title: true, slotDate: true, booked: true, blocked: true, fullDay: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return bookings;
}

// Cancel / update 

async function cancelBooking({ bookingId, reason, cancelledBy }) {
    const booking = await prisma.booking.findUnique({
        where:   { id: bookingId },
        include: { room: true }
    });

    if (!booking) throw new Error('BOOKING_NOT_FOUND');

    if (booking.status === 'CANCELLED') throw new Error('BOOKING_ALREADY_CANCELLED');
    if (booking.status === 'COMPLETED') throw new Error('BOOKING_COMPLETED');

    const hoursUntil = (new Date(booking.date) - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < CANCELLATION_WINDOW_HOURS) {
        throw new Error('CANCELLATION_WINDOW_EXPIRED');
    }

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data:  {
            status: 'CANCELLED',
            notes:  reason
                ? `Cancelled by ${cancelledBy}. Reason: ${reason}`
                : `Cancelled by ${cancelledBy}`
        },
        include: {
            room:    { select: { id: true, name: true } },
            user:    { select: { id: true, name: true, email: true } },
            payments: { select: { id: true, status: true, paymentReference: true } },
            slot: { select: { id: true, title: true, slotDate: true, booked: true, blocked: true, fullDay: true } }
        }
    });

    return sanitizeBooking(updated);
}

async function updateBookingStatus({ bookingId, status, updatedBy }) {
    const normalizedStatus = normalizeBookingStatus(status);
    if (!normalizedStatus || !BOOKING_STATUSES.includes(normalizedStatus)) {
        throw new Error('INVALID_BOOKING_STATUS');
    }

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });

    if (!booking) throw new Error('BOOKING_NOT_FOUND');

    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[booking.status];
    if (!allowedTransitions || !allowedTransitions.includes(normalizedStatus)) {
        throw new Error('INVALID_STATUS_TRANSITION');
    }

    const updater = updatedBy
        ? await prisma.user.findUnique({
            where: { id: updatedBy },
            select: { id: true, name: true, email: true }
        })
        : null;

    const updatedByLabel = updater?.name || updater?.email || updatedBy || 'system';
    const statusNote = `Status updated to ${normalizedStatus} by ${updatedByLabel}`;

    const updated = await prisma.$transaction(async (tx) => {
        const updatedBooking = await tx.booking.update({
            where: { id: bookingId },
            data:  {
                status: normalizedStatus,
                notes: booking.notes
                    ? `${booking.notes} | ${statusNote}`
                    : statusNote
            },
            include: {
                room:    { select: { id: true, name: true } },
                user:    { select: { id: true, name: true, email: true, role: true } },
                payments: { select: { id: true, status: true, paymentReference: true, paymentType: true, createdAt: true, recordMethod: true, paymentMethod: true, amount: true } },
                slot: { select: { id: true, title: true, slotDate: true, booked: true, blocked: true, fullDay: true } }
            }
        });

        await tx.bookSlot.update({
            where: { id: booking.slotId },
            data: { booked: isSlotActiveStatus(normalizedStatus) }
        });

        return updatedBooking;
    });

    return updated;
}

module.exports = {
    checkAvailability,
    createBooking,
    createNonUserBooking,
    createAdminUserBooking,
    getBookingsByUser,
    getBookingById,
    getAllBookings,
    cancelBooking,
    updateBookingStatus,
    normalizeBookingStatus,
    BOOKING_STATUSES
};
