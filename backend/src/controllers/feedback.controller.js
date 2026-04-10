
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.createFeedback = async (req, res) => {
  try {
    const { booking_id, user_id, rating, comment } = req.body;


    if (!booking_id || !user_id || rating === undefined || rating === null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const numericRating = Number.parseInt(rating, 10);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        booking_id,
        user_id,
        rating: numericRating,
        comment,
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Invalid reference: booking_id or user_id does not exist.',
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Feedback already exists for this booking and user.',
      });
    }

    res.status(500).json({ error: error.message });
  }
};


exports.getFeedbackByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const feedbacks = await prisma.feedback.findMany({
      where: { booking_id: bookingId },
      include: {
        user: true, 
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.feedback.delete({
      where: { id },
    });

    res.json({ message: "Feedback deleted" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.status(500).json({ error: error.message });
  }
};