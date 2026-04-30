const attendanceService = require('../services/attendanceService');
const fs = require('fs');
const path = require('path');

const prisma = require('../lib/prisma');

function isAdmin(authUser) {
    return authUser && authUser.role === 'ADMIN';
}

async function getAttendancesController(req, res, next) {
    try {
        const where = req.authUser.role === 'ADMIN' ? {} : { userId: req.authUser.id };
        const attendances = await prisma.attendance.findMany({
            where,
            include: {
                booking: { select: { id: true, reference: true, date: true, status: true } },
                user: { select: { id: true, name: true, email: true } },
            }
        });
        return res.status(200).json(attendances);
    } catch (error) {
        return next(error);
    }
}


// Update booking status - Admin only
async function checkInMemberController(req, res, next) {
    try {
        const { bookingId, numberOfAttendees } = req.body;
        const booking = await attendanceService.createMemberCheckin({ bookingId, numberOfAttendees });
        return res.status(200).json(booking);
    } catch (error) {
        if (error.message === 'BOOKING_NOT_FOUND') {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        return next(error);
    }
}

async function checkOutMemberController(req, res, next) {
    try {
        const { bookingId } = req.body;
        const result = await attendanceService.createMemberCheckOut({ bookingId });
        return res.status(200).json(result);
    } catch (error) {
        if (error.message === 'BOOKING_NOT_FOUND') {
            return res.status(404).json({ message: 'Booking not found.' });
        }        return next(error);
    }
}

module.exports = {
    getAttendancesController,
    checkInMemberController,
    checkOutMemberController
};