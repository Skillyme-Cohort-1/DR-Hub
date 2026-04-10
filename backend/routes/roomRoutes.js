const express = require('express')
const router = express.Router()
const roomController = require('../controllers/roomController')
const { authenticateToken } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/roleCheck')

// Public routes (anyone can view rooms)
router.get('/', roomController.getAllRooms)
router.get('/:id', roomController.getRoomById)

// Admin only routes
router.post('/admin/rooms', authenticateToken, requireAdmin, roomController.createRoom)
router.put('/admin/rooms/:id', authenticateToken, requireAdmin, roomController.updateRoom)
router.delete('/admin/rooms/:id', authenticateToken, requireAdmin, roomController.deleteRoom)

module.exports = router