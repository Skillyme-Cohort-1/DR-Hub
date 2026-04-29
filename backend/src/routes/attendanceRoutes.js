const express = require('express');
const {
    checkInMemberController,
    checkOutMemberController,
    getAttendancesController
} = require('../controllers/attendanceController');
const { 
  requireAuth, 
  requireAdmin 
} = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes — no auth required
router.get('/', requireAuth, getAttendancesController);
router.post('/check-in', requireAuth, requireAdmin, checkInMemberController);
router.post('/check-out', requireAuth, requireAdmin, checkOutMemberController);

module.exports = router;