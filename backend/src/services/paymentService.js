// Imports
const prisma = require('../lib/prisma');
const buniAPI = require('../lib/buniAPI');
const BUNI_CONFIG = require('../config/buni');

function generateManualPaymentReference() {
    const date   = new Date();
    const year   = date.getFullYear();
    const month  = String(date.getMonth() + 1).padStart(2, '0');
    const day    = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PMT-${year}${month}${day}-${random}`;
}


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
        userId: booking.userId,
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

exports.createManualPayment = async (bookingId, amount, paymentType) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (paymentType === 'Deposit' && booking.depositPaid) {
      throw new Error('Deposit has already been paid for this booking');
    }

    const bookingUpdateData = {};

    if (paymentType === 'Deposit') {
      bookingUpdateData.depositPaid = true;
      bookingUpdateData.status = 'CONFIRMED';
      bookingUpdateData.amountPaid = { increment: amount };
    } else if (paymentType === 'Full Payment') {
      bookingUpdateData.depositPaid = true;
      bookingUpdateData.amountPaid = amount;
    } else {
      bookingUpdateData.amountPaid = { increment: amount };
    }

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          userId: booking.userId,
          bookingId,
          amount,
          currency: 'KES',
          recordMethod: 'MANUAL',
          paymentMethod: 'KCB Pay Bill',
          status: 'COMPLETED',
          paymentType: paymentType,
          paymentReference: generateManualPaymentReference(),
        },
      });
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: bookingUpdateData,
      });

      if (updatedBooking.amountPaid === updatedBooking.amountCharged) {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED', depositPaid: true },
        });
      }

      return createdPayment;
    });

    return payment;
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

exports.getUserPayments = async (userId) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return payments;
  } catch (error) {
    throw error;
  }
};
