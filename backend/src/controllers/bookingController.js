const bookingService = require('../services/bookingService');
const {
    createBookingSchema,
    availabilitySchema,
    cancelBookingSchema,
    validate
} = require('../validators/bookingValidator');

function isAdmin(authUser) {
    return authUser && authUser.role === 'ADMIN';  // fixed: == → ===
}

// Check availability
async function checkAvailability(req, res, next) {
    try {
        const query = { ...req.query };

        const { success, data, errors } = validate(availabilitySchema, query);
        if (!success) {
            return res.status(400).json({ message: 'Validation failed.', errors });
        }

        const result = await bookingService.checkAvailability(data);

        return res.status(200).json({
            message: 'Availability checked successfully.',
            available: result.available,
            roomId: result.roomId,
            date: result.date,
            slot: result.slot,
            ...(result.reason && { reason: result.reason })
        });
    } catch (error) {
        return next(error);
    }
}

// Create booking
async function createBooking(req, res, next) {
    try {
        const { success, data, errors } = validate(createBookingSchema, req.body);
        if (!success) {
            return res.status(400).json({ message: 'Validation failed.', errors });
        }

        const userId = req.authUser.id;

        const booking = await bookingService.createBooking({ ...data, userId });

        return res.status(201).json({
            message: 'Booking created successfully.',
            booking
        });
    } catch (error) {
        if (error.message === 'ROOM_NOT_FOUND') {
            return res.status(404).json({ message: 'Room not found.' });
        }
        if (error.message === 'SLOT_UNAVAILABLE') {
            return res.status(409).json({ message: 'This slot is already booked.' });
        }
        if (error.message === 'ROOM_INACTIVE') {
            return res.status(400).json({ message: 'This room is no longer available for booking.' });
        }
        if (error.message === 'NO_APPROVED_DOCUMENT') {
            return res.status(403).json({ message: 'You must have an approved qualification document before booking.' });
        }
        return next(error);
    }
}

// Get my bookings
async function getMyBookings(req, res, next) {
    try {
        const userId = req.authUser.id;
        const bookings = await bookingService.getBookingsByUser(userId);

        return res.status(200).json({
            message: 'Bookings fetched successfully.',
            count: bookings.length,
            bookings
        });
    } catch (error) {
        return next(error);
    }
}

// Get booking by ID
async function getBookingById(req, res, next) {
    try {
        const { id } = req.params;
        const booking = await bookingService.getBookingById(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Ownership check
        if (!isAdmin(req.authUser) && booking.userId !== req.authUser.id) {
            return res.status(403).json({
                message: 'You do not have permission to view this booking.'
            });
        }

        return res.status(200).json({
            message: 'Booking fetched successfully.',
            booking
        });
    } catch (error) {
        return next(error);
    }
}

// Cancel booking
async function cancelBooking(req, res, next) {
    try {
        const { id } = req.params;

        const { success, data, errors } = validate(cancelBookingSchema, req.body);
        if (!success) {
            return res.status(400).json({ message: 'Validation failed.', errors });
        }

        const existing = await bookingService.getBookingById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Ownership check
        if (!isAdmin(req.authUser) && existing.userId !== req.authUser.id) {
            return res.status(403).json({
                message: 'You do not have permission to cancel this booking.'
            });
        }

        const booking = await bookingService.cancelBooking({
            bookingId: id,
            reason: data.reason,
            cancelledBy: req.authUser.id
        });

        return res.status(200).json({
            message: 'Booking cancelled successfully.',
            booking
        });
    } catch (error) {
        if (error.message === 'BOOKING_ALREADY_CANCELLED') {
            return res.status(400).json({ message: 'This booking is already cancelled.' });
        }
        if (error.message === 'BOOKING_COMPLETED') {
            return res.status(400).json({ message: 'A completed booking cannot be cancelled.' });
        }
        if (error.message === 'CANCELLATION_WINDOW_EXPIRED') {
            return res.status(400).json({ message: 'This booking can no longer be cancelled. Contact DR Hub directly.' });
        }
        return next(error);
    }
}

// Get all bookings - Admin only
async function getAllBookings(req, res, next) {
    try {
        const { status, roomId, date } = { ...req.query };

        const bookings = await bookingService.getAllBookings({
            status,
            roomId,
            date
        });

        return res.status(200).json({
            message: 'Bookings fetched successfully.',
            count: bookings.length,
            bookings
        });
    } catch (error) {
        return next(error);
    }
}

// Update booking status - Admin only
async function updateBookingStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `status must be one of: ${allowedStatuses.join(', ')}`
            });
        }

        const existing = await bookingService.getBookingById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        const booking = await bookingService.updateBookingStatus({
            bookingId: id,
            status,
            updatedBy: req.authUser.id
        });

        return res.status(200).json({
            message: 'Booking status updated successfully.',
            booking
        });
    } catch (error) {
        if (error.message === 'INVALID_STATUS_TRANSITION') {
            return res.status(400).json({ message: 'This status transition is not allowed.' });
        }
        return next(error);
    }
}

module.exports = {
    checkAvailability,
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getAllBookings,
    updateBookingStatus
};