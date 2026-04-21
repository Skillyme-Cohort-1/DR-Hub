const prisma                      = require('../lib/prisma');
const roomService                 = require('./roomService');
const { sendBookingPendingEmail } = require('../../emails');

const CANCELLATION_WINDOW_HOURS = 24;

const ALLOWED_STATUS_TRANSITIONS = {
    PENDING:   ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW:   []
};

function generateBookingReference() {
    const date   = new Date();
    const year   = date.getFullYear();
    const month  = String(date.getMonth() + 1).padStart(2, '0');
    const day    = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DRH-${year}${month}${day}-${random}`;
}

function formatAmountKES(amountCents) {
    return (amountCents / 100).toLocaleString('en-KE', {
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
        notes:         booking.notes || null,
        room: booking.room ? {
            id:   booking.room.id,
            name: booking.room.name
        } : null,
        user: booking.user ? {
            id:    booking.user.id,
            name:  booking.user.name,
            email: booking.user.email,
        } : null,
        payment: booking.payment ? {
            id:          booking.payment.id,
            status:      booking.payment.status,
            providerRef: booking.payment.providerRef || null
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

async function createBooking({ roomId, date, slot, name, email }) {
    const user = await findOrCreateUser({ name, email });

    const room = await roomService.getRoomById(roomId);
    if (!room)           throw new Error('ROOM_NOT_FOUND');
    if (!room.is_active) throw new Error('ROOM_INACTIVE');

    const approvedDocument = await prisma.userDocument.findFirst({
        where: { userId: user.id, status: 'APPROVED' }
    });

    if (!approvedDocument) {
        throw new Error('NO_APPROVED_DOCUMENT');
    }

    const availability = await checkAvailability({ roomId, date, slot, room });
    if (!availability.available) {
        throw new Error('SLOT_UNAVAILABLE');
    }

    const amountCharged = room.cost;
    if (!amountCharged) {
        throw new Error('ROOM_COST_NOT_SET');
    }

    let reference;
    let referenceIsUnique = false;

    while (!referenceIsUnique) {
        reference      = generateBookingReference();
        const existing = await prisma.booking.findUnique({ where: { reference } });
        if (!existing) referenceIsUnique = true;
    }

    let booking;
    try {
        booking = await prisma.booking.create({
            data: {
                reference,
                date:   new Date(date),
                slot,
                status: 'PENDING',
                amountCharged,
                userId: user.id,
                roomId
            },
            include: {
                room:    { select: { id: true, name: true } },
                user:    { select: { id: true, name: true, email: true } },
                payment: true
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error('SLOT_UNAVAILABLE');
        }
        throw error;
    }

    // Send payment instructions email
    try {
        await sendBookingPendingEmail({
            to:        user.email,
            name:      user.name,
            reference: booking.reference,
            roomName:  room.name,
            date:      new Date(booking.date).toDateString(),
            slot:      booking.slot,
            amountDue: formatAmountKES(booking.amountCharged)
        });
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
            payment: { select: { id: true, status: true, providerRef: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return bookings.map(sanitizeBooking);
}

async function getBookingById(id) {
    const booking = await prisma.booking.findUnique({
        where:   { id },
        include: {
            room:    { select: { id: true, name: true } },
            user:    { select: { id: true, name: true, email: true } },
            payment: { select: { id: true, status: true, providerRef: true } }
        }
    });

    if (!booking) return null;
    return sanitizeBooking(booking);
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
            user:    { select: { id: true, name: true, email: true } },
            payment: { select: { id: true, status: true, providerRef: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return bookings.map(sanitizeBooking);
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
            payment: { select: { id: true, status: true, providerRef: true } }
        }
    });

    return sanitizeBooking(updated);
}

async function updateBookingStatus({ bookingId, status, updatedBy }) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });

    if (!booking) throw new Error('BOOKING_NOT_FOUND');

    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[booking.status];
    if (!allowedTransitions.includes(status)) {
        throw new Error('INVALID_STATUS_TRANSITION');
    }

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data:  {
            status,
            notes: booking.notes
                ? `${booking.notes} | Status updated to ${status} by ${updatedBy}`
                : `Status updated to ${status} by ${updatedBy}`
        },
        include: {
            room:    { select: { id: true, name: true } },
            user:    { select: { id: true, name: true, email: true } },
            payment: { select: { id: true, status: true, providerRef: true } }
        }
    });

    return sanitizeBooking(updated);
}

module.exports = {
    checkAvailability,
    createBooking,
    getBookingsByUser,
    getBookingById,
    getAllBookings,
    cancelBooking,
    updateBookingStatus
};