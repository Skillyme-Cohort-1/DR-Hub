const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get all bookings with related data
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        room: true,
        payment: true
      }
    });

    console.log(`Found ${bookings.length} bookings`);

    // Total bookings
    const totalBookings = bookings.length;

    // Total revenue (only paid bookings)
    const totalRevenue = bookings
      .filter(b => b.payment?.status === 'paid' || b.payment === 'paid')
      .reduce((sum, b) => sum + (Number(b.amountCharged) || 0), 0);

    // Pending bookings
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;

    // Confirmed bookings
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'approved').length;

    // Revenue by month (last 6 months)
    const revenueByMonth = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const monthRevenue = bookings
        .filter(b => {
          const bookingDate = new Date(b.date);
          return bookingDate.getMonth() === d.getMonth() && 
                 bookingDate.getFullYear() === d.getFullYear() &&
                 (b.payment?.status === 'paid' || b.payment === 'paid');
        })
        .reduce((sum, b) => sum + (Number(b.amountCharged) || 0), 0);
      revenueByMonth.push({ month: monthName, amount: monthRevenue });
    }

    // Booking status breakdown
    const bookingStatus = {
      PENDING: bookings.filter(b => b.status === 'pending').length,
      CONFIRMED: bookings.filter(b => b.status === 'confirmed' || b.status === 'approved').length,
      COMPLETED: bookings.filter(b => b.status === 'completed').length,
      REJECTED: bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').length
    };

    // Get all rooms
    const rooms = await prisma.room.findMany();
    
    // Bookings by room
    const bookingsByRoom = rooms
      .map(room => {
        const count = bookings.filter(b => b.roomId === room.id).length;
        return {
          name: room.name,
          count: count,
          percentage: totalBookings ? Math.round((count / totalBookings) * 100) : 0
        };
      })
      .filter(r => r.count > 0);

    // Member vs Non-member
    const memberCount = bookings.filter(b => b.user?.role === 'MEMBER').length;
    const nonMemberCount = bookings.filter(b => b.user && b.user?.role !== 'MEMBER' && b.user?.role !== 'ADMIN').length;

    // Send response
    res.json({
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
        revenueByMonth,
        bookingStatus,
        bookingsByRoom,
        memberVsNonMember: {
          member: memberCount,
          nonMember: nonMemberCount
        }
      }
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics data',
      error: error.message 
    });
  }
});

module.exports = router;