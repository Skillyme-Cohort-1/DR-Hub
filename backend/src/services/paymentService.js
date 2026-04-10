// Imports
const prisma = require('../lib/prisma');
const buniAPI = require('../lib/buniAPI');
const BUNI_CONFIG = require('../config/buni');

// Create payment record for a booking
exports.createPayment = async (userId, bookingId) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new Error('Booking is not in PENDING status');
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        bookingId,
        amount: 0,
        currency: BUNI_CONFIG.CURRENCY,
        status: BUNI_CONFIG.PAYMENT_STATUSES.PENDING,
      },
    });

    const buniResponse = await buniAPI.initializePayment(payment.id, payment.amount, payment.currency);

    return {
      ...payment,
      paymentUrl: buniResponse.paymentUrl,
    };
  } catch (error) {
    throw error;
  }
};

// Process webhook callback from Buni
exports.processPaymentWebhook = async (paymentId, status, transactionRef) => {
  try {
    if (!Object.values(BUNI_CONFIG.PAYMENT_STATUSES).includes(status)) {
      throw new Error('Invalid payment status');
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Idempotency check - if already processed, return success
    if (payment.status !== BUNI_CONFIG.PAYMENT_STATUSES.PENDING) {
      return payment;
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        paymentReference: transactionRef,
      },
    });

    // If payment completed, trigger booking update
    if (status === BUNI_CONFIG.PAYMENT_STATUSES.COMPLETED) {
      await exports.triggerBookingUpdate(payment.bookingId);
      // TODO: Queue notification (don't block webhook response)
    }

    return updatedPayment;
  } catch (error) {
    throw error;
  }
};

// Trigger booking update when payment completes
exports.triggerBookingUpdate = async (bookingId) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    // TODO: Queue notification (async, don't block webhook response)
    // await notificationQueue.enqueue({
    //   type: 'PAYMENT_COMPLETED',
    //   bookingId,
    //   userId: booking.userId,
    // });

    return updatedBooking;
  } catch (error) {
    throw error;
  }
};
