const express = require('express');
const {
  checkAvailability,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { 
  requireAuth, 
  requireAdmin 
} = require('../middleware/authMiddleware');

const router = express.Router();

// Check slot availability
router.get('/availability', requireAuth, checkAvailability);

// Create a new booking
router.post('/', requireAuth, createBooking);

// Get own bookings — must come before /:id
router.get('/my-bookings', requireAuth, getMyBookings);

// Get single booking by ID
router.get('/:id', requireAuth, getBookingById);

// Cancel a booking
router.patch('/:id/cancel', requireAuth, cancelBooking);

// Get all bookings with optional filters
router.get('/', requireAuth, requireAdmin, getAllBookings);

// Update booking status
router.patch('/:id/status', requireAuth, requireAdmin, updateBookingStatus);

module.exports = router;