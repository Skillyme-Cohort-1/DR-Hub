const express = require('express');
const router = express.Router();
const bookingSlotController = require("../controllers/slotControllers");
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Public route (anyone can view slots for a room)
router.get('/', bookingSlotController.getAllBookingSlots);
router.get('/:id', bookingSlotController.getBookingSlots);
// Protected route (admins create slots)
router.post('/', requireAuth, requireAdmin, bookingSlotController.createBookingSlot);

module.exports = router;
