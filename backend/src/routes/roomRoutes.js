const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Public routes (anyone can view rooms)
router.get('/', roomController.getAllRooms);
//router.get('/:id', roomController.getRoomById);

// Admin only routes (requireAuth + requireAdmin)
router.post('/', requireAuth, requireAdmin, roomController.createRoom);
router.put('/:id', requireAuth, requireAdmin, roomController.updateRoom);
router.delete('/:id', requireAuth, requireAdmin, roomController.deleteRoom);

module.exports = router;
