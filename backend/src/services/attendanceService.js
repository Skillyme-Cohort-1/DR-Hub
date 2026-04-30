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
    return (amountCents).toLocaleString('en-KE', {
        style:    'currency',
        currency: 'KES'
    });
}


async function createMemberCheckin({bookingId, numberOfAttendees}) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });
    if (!booking) throw new Error('BOOKING_NOT_FOUND');
    
    const user = await prisma.user.findUnique({
        where: { id: booking.userId },
        select: { id: true, name: true, email: true, status: true }
    });
    if (!user) throw new Error('USER_NOT_FOUND');
    

    let attendance;
    try {
        attendance = await prisma.$transaction(async (tx) => {
            const createdAttendance = await tx.attendance.create({
                data: {
                    bookingId,
                    userId: booking.userId,
                    numberOfAttendees
                },
                include: {
                    booking: { select: { id: true, reference: true, date: true, status: true } },
                    user: { select: { id: true, name: true, email: true } },
                }
            });

            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'CHECKED_IN' }
            });

            return createdAttendance;
        });
    } catch (error) {
        if (error.code === 'P2002') {
            const targets = Array.isArray(error.meta?.target)
                ? error.meta.target
                : [String(error.meta?.target || '')];
            if (targets.some((target) => String(target).includes('slotId'))) {
                throw new Error('BOOKING_UNAVAILABLE');
            }
        }
        throw error;
    }

    return {"message": "Check-in was successful"};
}


async function createMemberCheckOut({bookingId}) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });
    if (!booking) throw new Error('BOOKING_NOT_FOUND');


    const attendance = await prisma.attendance.findUnique({
        where: { bookingId: bookingId },
        include: {
            booking: { select: { id: true, reference: true, date: true, status: true } },
            user: { select: { id: true, name: true, email: true } },
        }
    });
    if (!attendance) throw new Error('ATTENDANCE_NOT_FOUND');
    
    const user = await prisma.user.findUnique({
        where: { id: attendance.userId },
        select: { id: true, name: true, email: true, status: true }
    });
    if (!user) throw new Error('USER_NOT_FOUND');
    

    let newAttendance;
    try {
        newAttendance = await prisma.$transaction(async (tx) => {
            const updatedAttendance = await tx.attendance.update({
                where: { id: attendance.id },
                data: { checkOutTime: new Date() },
                include: {
                    booking: { select: { id: true, reference: true, date: true, status: true } },
                    user: { select: { id: true, name: true, email: true } },
                }
            });

            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'COMPLETED' }
            });

            return updatedAttendance;
        });
    } catch (error) {
        if (error.code === 'P2002') {
            const targets = Array.isArray(error.meta?.target)
                ? error.meta.target
                : [String(error.meta?.target || '')];
            if (targets.some((target) => String(target).includes('slotId'))) {
                throw new Error('BOOKING_UNAVAILABLE');
            }
        }
        throw error;
    }

    return {"message": "Check-out was successful"};
}


module.exports = {
    createMemberCheckOut,
    createMemberCheckin
};