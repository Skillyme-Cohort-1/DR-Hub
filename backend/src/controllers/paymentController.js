// Imports
const prisma = require('../lib/prisma');
const paymentService = require('../services/paymentService');
const BUNI_CONFIG = require('../config/buni');

// Helper: Sanitize payment data for response
const sanitizePayment = (payment) => {
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    paymentReference: payment.paymentReference,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
};

// Helper: Check if user is authorized to view payment
const isAuthorized = (authUser, payment) => {
  return authUser.role === 'ADMIN' || payment.userId === authUser.id;
};


exports.createManualPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentType } = req.body;
    if (!bookingId || !amount || !paymentType) {
      return res.status(400).json({ message: 'bookingId, amount, and paymentType are required' });
    }
    const payment = await paymentService.createManualPayment(bookingId, amount, paymentType);
    res.status(201).json({
      message: 'Manual payment created successfully',
      data: sanitizePayment(payment),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating manual payment', error: error.message });
  }
};

// User function: Initiate a new payment
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.authUser.id;

    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const payment = await paymentService.createPayment(userId, bookingId);

    res.status(201).json({
      message: 'Payment initiated successfully',
      data: sanitizePayment(payment),
      paymentUrl: payment.paymentUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating payment', error: error.message });
  }
};

// Webhook: Handle payment confirmation from Buni
exports.handlePaymentWebhook = async (req, res) => {
  try {
    const { paymentId, status, transactionRef } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({ message: 'paymentId and status are required' });
    }

    const payment = await paymentService.processPaymentWebhook(paymentId, status, transactionRef);

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
};

// User function: Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (!isAuthorized(req.authUser, payment)) {
      return res.status(403).json({ message: 'You do not have permission to view this payment' });
    }
    res.status(200).json({
      message: 'Payment retrieved successfully',
      data: sanitizePayment(payment),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};

// User function: Get payment by booking ID
exports.getPaymentByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: { bookingId },
    });

    if (payment && !isAuthorized(req.authUser, payment)) {
      return res.status(403).json({ message: 'You do not have permission to view this payment' });
    }

    res.status(200).json({
      message: 'Payment retrieved successfully',
      data: payment ? sanitizePayment(payment) : null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};

// Admin function: Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const where = req.authUser.role === 'ADMIN' ? {} : { userId: req.authUser.id };
    const payments = await prisma.payment.findMany({
      where,
    });

    res.status(200).json({
      message: 'Payments retrieved successfully',
      data: payments.map(sanitizePayment),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Admin function: Get payments by user ID
exports.getPaymentsByUserId = async (req, res) => {
  try {
    if (req.authUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can view user payments' });
    }

    const { userId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        booking: true,
      },
    });

    res.status(200).json({
      message: 'User payments retrieved successfully',
      data: payments.map(sanitizePayment),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user payments', error: error.message });
  }
};

// Admin function: Update payment status manually
exports.updatePaymentStatus = async (req, res) => {
  try {
    if (req.authUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update payment status' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    if (!Object.values(BUNI_CONFIG.PAYMENT_STATUSES).includes(status)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      message: 'Payment status updated successfully',
      data: sanitizePayment(updatedPayment),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
};

// Admin function: Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    if (req.authUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can view payment statistics' });
    }

    const totalPayments = await prisma.payment.count();
    const completedPayments = await prisma.payment.count({
      where: { status: BUNI_CONFIG.PAYMENT_STATUSES.COMPLETED },
    });
    const pendingPayments = await prisma.payment.count({
      where: { status: BUNI_CONFIG.PAYMENT_STATUSES.PENDING },
    });
    const failedPayments = await prisma.payment.count({
      where: { status: BUNI_CONFIG.PAYMENT_STATUSES.FAILED },
    });

    res.status(200).json({
      message: 'Payment statistics retrieved successfully',
      data: {
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment statistics', error: error.message });
  }
};


exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.authUser.id;
    const payments = await paymentService.getUserPayments(userId);
    res.status(200).json({
      message: 'User payments retrieved successfully',
      data: payments.map(sanitizePayment),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user payments', error: error.message });
  }
};
