const prisma = require('../lib/prisma');

class BookingSlotService {
  // Get booking slots for a room
  async getAllBookingSlots() {
    return await prisma.bookSlot.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        room:    { select: { id: true, name: true, cost: true, capacity: true } },
      }
    })
  }

  async getBookingSlots(roomId) {
    return await prisma.bookSlot.findMany({
      orderBy: { createdAt: 'desc' },
      where: { roomId }
    })
  }
  
  // Create new booking slot
  async createBookingSlot(data) {

    const { title, roomId, slotDate, fullDay } = data
    
    // Validate
    if (!title || !roomId || !slotDate) {
      throw new Error('Title, Room ID, slot date and fullDay are required')
    }

    // Accept both date-only (YYYY-MM-DD) and full ISO datetime inputs.
    const normalizedSlotDate = new Date(slotDate)
    if (Number.isNaN(normalizedSlotDate.getTime())) {
      throw new Error('slotDate must be a valid date or ISO datetime')
    }
    
    
    // Ensure the referenced room exists before creating the slot.
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new Error('Room not found for the provided roomId')
    }
    
    // A duplicate exists only for the same room, title and slot date.
    const existing = await prisma.bookSlot.findFirst({
      where: {
        roomId,
        slotDate: normalizedSlotDate,
        fullDay: fullDay || false,
        title: { equals: title, mode: 'insensitive' }
      }
    })
    
    if (existing) {
      throw new Error('Booking slot title already exists for this room and date')
    }
    
    return await prisma.bookSlot.create({
      data: {
        title: title,
        roomId: roomId,
        booked: false,
        slotDate: normalizedSlotDate,
        fullDay: fullDay || false
      }
    })
  }
}

module.exports = new BookingSlotService()
