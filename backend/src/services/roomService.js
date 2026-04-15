const prisma = require('../lib/prisma');

class RoomService {
  // Get all rooms (clients see only active rooms)
  async getAllRooms(includeInactive = false) {
    const where = includeInactive ? {} : { is_active: true }
    
    return await prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  // Get single room by ID
  async getRoomById(id) {
    return await prisma.room.findUnique({
      where: { id }
    })
  }

  // Create new room (admin only)
  async createRoom(data) {
    const { name, capacity, description, cost, imageUrl } = data
    
    // Validate
    if (!name || !capacity) {
      throw new Error('Name and capacity are required')
    }
    
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0')
    }
    
    // Check for duplicate room name
    const existing = await prisma.room.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })
    
    if (existing) {
      throw new Error('Room with this name already exists')
    }
    
    return await prisma.room.create({
      data: {
        name,
        capacity: parseInt(capacity),
        description: description || null,
        imageUrl: imageUrl || null,
        cost: cost || 0,
        is_active: true
      }
    })
  }

  // Update room (admin only)
  async updateRoom(id, data) {
    // Check if room exists
    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) {
      throw new Error('Room not found')
    }
    
    // If renaming, check for duplicates
    if (data.name && data.name !== room.name) {
      const existing = await prisma.room.findFirst({
        where: { 
          name: { equals: data.name, mode: 'insensitive' },
          id: { not: id }
        }
      })
      
      if (existing) {
        throw new Error('Room with this name already exists')
      }
    }
    
    return await prisma.room.update({
      where: { id },
      data: {
        ...data,
        capacity: data.capacity ? parseInt(data.capacity) : undefined
      }
    })
  }

  // Soft delete room (just deactivate)
  async deleteRoom(id) {
    // Check if room exists
    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) {
      throw new Error('Room not found')
    }
    
    return await prisma.room.update({
      where: { id },
      data: { is_active: false }
    })
  }
}

module.exports = new RoomService()
