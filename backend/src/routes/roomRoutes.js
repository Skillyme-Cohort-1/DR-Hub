const express = require('express')
const router = express.Router()
const roomController = require('../controllers/roomController')
const {
  requireAuth,
  requireAdmin,
  requireSelfOrAdmin,
} = require('../middleware/authMiddleware');


// Public routes (anyone can view rooms)
router.get('/', roomController.getAllRooms)
router.get('/:id', roomController.getRoomById)

// Admin only routes
router.post('/admin/rooms', requireAuth, requireAdmin, roomController.createRoom)
router.put('/admin/rooms/:id', requireAuth, requireAdmin, roomController.updateRoom)
router.delete('/admin/rooms/:id', requireAuth, requireAdmin, roomController.deleteRoom)

module.exports = router