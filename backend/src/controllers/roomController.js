const roomService = require('../services/roomService')

class RoomController {
  // GET /api/rooms
  async getAllRooms(req, res) {
    try {
      // Check if user is admin from Paul's auth middleware
      const includeInactive = req.authUser?.role === 'ADMIN'
      const rooms = await roomService.getAllRooms(includeInactive)
      
      res.json({
        success: true,
        data: rooms
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }

  // GET /api/rooms/:id
  async getRoomById(req, res) {
    try {
      const room = await roomService.getRoomById(req.params.id)
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        })
      }
      
      // Clients shouldn't see inactive rooms
      if (!room.is_active && req.authUser?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        })
      }
      
      res.json({
        success: true,
        data: room
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }

  // POST /api/admin/rooms (admin only)
  async createRoom(req, res) {
    try {
      const room = await roomService.createRoom(req.body)
      
      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room
      })
    } catch (error) {
      const status = error.message.includes('already exists') ? 409 : 400
      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  // PUT /api/admin/rooms/:id (admin only)
  async updateRoom(req, res) {
    try {
      const room = await roomService.updateRoom(req.params.id, req.body)
      
      res.json({
        success: true,
        message: 'Room updated successfully',
        data: room
      })
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400
      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  // DELETE /api/admin/rooms/:id (admin only)
  async deleteRoom(req, res) {
    try {
      await roomService.deleteRoom(req.params.id)
      
      res.json({
        success: true,
        message: 'Room deactivated successfully'
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
}

module.exports = new RoomController()
