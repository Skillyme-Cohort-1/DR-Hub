const BookingSlotService = require("../services/bookingSlotService")

class BookingSlotController {
    async getAllBookingSlots(req, res) {
        try {
            const bookingSlots = await BookingSlotService.getAllBookingSlots()
            res.json({
                success: true,
                data: bookingSlots
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
    async getBookingSlots(req, res) {
        try {
            const bookingSlots = await BookingSlotService.getBookingSlots(req.params.id)
            res.json({
                success: true,
                data: bookingSlots
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    async createBookingSlot(req, res) {
        try {
            const bookingSlot = await BookingSlotService.createBookingSlot(req.body)
            res.status(201).json({
                success: true,
                message: 'Booking slot created successfully',
                data: bookingSlot
            })
        } catch (error) {
            const status = error.message.includes('already exists') ? 409 : 400
            res.status(status).json({
                success: false,
                message: error.message
            })
        }
    }
}

module.exports = new BookingSlotController()