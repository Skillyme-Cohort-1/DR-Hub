const prisma      = require('../lib/prisma');
const roomService = require('./roomService');

// Pricing in KES cents to avoid floating point arithmetic errors
const PRICING = {
    BOARDROOM: {
        WEEKDAY: {
            MEMBER:     150000,
            NON_MEMBER: 250000,
        },
        WEEKEND: {
            MEMBER:     200000,
            NON_MEMBER: 300000,
        }
    },
    PRIVATE_OFFICE: {
        WEEKDAY: {
            MEMBER:     100000,
            NON_MEMBER: 150000,
        },
        WEEKEND: {
            MEMBER:     120000,
            NON_MEMBER: 180000,
        }
    },
    COMBINED_SPACE: {
        WEEKDAY: {
            MEMBER:     200000,
            NON_MEMBER: 350000,
        },
        WEEKEND: {
            MEMBER:     250000,
            NON_MEMBER: 400000,
        }
    }
};

// How many hours before a session a client can still cancel
const CANCELLATION_WINDOW_HOURS = 24;

// Valid status transitions — terminal states have empty arrays
const ALLOWED_STATUS_TRANSITIONS = {
    PENDING:   ['CONFIRMED', 'CANCELLED'],  // fixed typo: was 'cONFIRMED'
    CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW:   []
};

// Generate human-readable booking reference e.g. DRH-20250604-A3F9
function generateBookingReference() {
    const date   = new Date();
    const year   = date.getFullYear();
    const month  = String(date.getMonth() + 1).padStart(2, '0');
    const day    = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DRH-${year}${month}${day}-${random}`;
}

// Determine if a date falls on a weekend — used for pricing
function isWeekend(dateString) {
    const date      = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
}

// Map room name to pricing key
function getRoomPricingKey(roomName) {
    const map = {
        'Thunder Client Room':      'BOARDROOM',
        'Private Office': 'PRIVATE_OFFICE',
        'Combined Space': 'COMBINED_SPACE'
    };
    return map[roomName] || null;
}

// Calculate amount to charge based on room, date, membership
// Returns amount in KES cents
function calculatePrice(roomName, date, isMember) {
    const roomKey = getRoomPricingKey(roomName);
    if (!roomKey) return null;

    const dayType    = isWeekend(date) ? 'WEEKEND' : 'WEEKDAY';
    const memberType = isMember ? 'MEMBER' : 'NON_MEMBER';

    return PRICING[roomKey][dayType][memberType];
}

// Sanitize booking for API response — never expose raw db fields
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

// Check slot availability
// Accepts optional pre-fetched room to avoid duplicate DB calls
async function checkAvailability({ roomId, date, slot, room = null }) {

    // Use pre-fetched room if provided, otherwise fetch it
    // createBooking passes the room in — standalone calls fetch it here
    const resolvedRoom = room || await roomService.getRoomById(roomId);

    if (!resolvedRoom) {
        return { available: false, roomId, date, slot, reason: 'Room not found' };
    }

    if (!resolvedRoom.is_active) {
        return { available: false, roomId, date, slot, reason: 'Room is not available for booking' };
    }

    // Block on both PENDING and CONFIRMED — prevents slot being taken
    // while another payment is still in progress
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

// Create a booking
async function createBooking({ roomId, date, slot, userId }) {

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { id: true, name: true, email: true, status: true, role: true }
    });

    if (!user || user.status !== 'ACTIVE') {
        throw new Error('USER_NOT_ACTIVE');
    }

    // Verify room exists and is active — using roomService, not raw prisma
    const room = await roomService.getRoomById(roomId);
    if (!room)           throw new Error('ROOM_NOT_FOUND');
    if (!room.is_active) throw new Error('ROOM_INACTIVE');

    // Verify user has an approved qualification document
    const approvedDocument = await prisma.userDocument.findFirst({
        where: { userId, status: 'APPROVED' }
    });

    if (!approvedDocument) {
        throw new Error('NO_APPROVED_DOCUMENT');
    }

    // Check availability — pass room in to avoid fetching it again
    const availability = await checkAvailability({ roomId, date, slot, room });
    if (!availability.available) {
        throw new Error('SLOT_UNAVAILABLE');
    }

    // Calculate price — snapshot at booking time
    const isMember      = user.role === 'MEMBER';
    const amountCharged = calculatePrice(room.name, date, isMember);

    if (!amountCharged) {
        throw new Error('PRICING_NOT_FOUND');
    }

    // Generate unique booking reference
    let reference;
    let referenceIsUnique = false;

    while (!referenceIsUnique) {
        reference         = generateBookingReference();
        const existing    = await prisma.booking.findUnique({ where: { reference } });
        if (!existing) referenceIsUnique = true;
    }

    // Create the booking — PENDING until payment webhook confirms it
    // @@unique([roomId, date, slot]) is the final DB-level guard
    try {
        const booking = await prisma.booking.create({
            data: {
                reference,
                date:          new Date(date),
                slot,
                status:        'PENDING',
                amountCharged,
                userId,
                roomId
            },
            include: {
                room:    { select: { id: true, name: true } },
                user:    { select: { id: true, name: true, email: true } },
                payment: true
            }
        });

        return sanitizeBooking(booking);
    } catch (error) {
        // P2002 = unique constraint violation — two requests hit simultaneously
        if (error.code === 'P2002') {
            throw new Error('SLOT_UNAVAILABLE');
        }
        throw error;
    }
}

// Get all bookings for a specific user
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

// Get single booking by ID — ownership check done in controller
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

// Get all bookings — admin only, supports optional filters
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

// Cancel a booking — enforces 24-hour window for client cancellations
async function cancelBooking({ bookingId, reason, cancelledBy }) {

    const booking = await prisma.booking.findUnique({
        where:   { id: bookingId },
        include: { room: true }
    });

    // Guard: terminal states cannot be cancelled
    if (booking.status === 'CANCELLED') throw new Error('BOOKING_ALREADY_CANCELLED');
    if (booking.status === 'COMPLETED') throw new Error('BOOKING_COMPLETED');

    // Guard: cannot cancel within 24 hours of session
    const hoursUntil = (new Date(booking.date) - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < CANCELLATION_WINDOW_HOURS) {
        throw new Error('CANCELLATION_WINDOW_EXPIRED');
    }

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data:  {
            status: 'CANCELLED',
            notes: reason
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

// Update booking status — admin only, validates transition is allowed
async function updateBookingStatus({ bookingId, status, updatedBy }) {

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });

    // Guard: only allow defined transitions
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