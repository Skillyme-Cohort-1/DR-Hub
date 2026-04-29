const express = require('express');
const {
  checkAvailability,
  createBooking,
  adminUserBooking,
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

// Public routes — no auth required
router.get('/availability', checkAvailability);
router.post('/', requireAuth, createBooking);
router.post('/admin-user', requireAuth, requireAdmin, adminUserBooking);

// Authenticated routes
router.get('/my-bookings', requireAuth, getMyBookings);
router.get('/:id', requireAuth, getBookingById);
router.patch('/:id/cancel', requireAuth, cancelBooking);

// Admin only routes
router.get('/', requireAuth, requireAdmin, getAllBookings);
router.patch('/:id/status', requireAuth, requireAdmin, updateBookingStatus);

module.exports = router;