const express = require('express');
const {
  initiatePayment,
  handlePaymentWebhook,
  getPaymentById,
  getPaymentByBookingId,
  getAllPayments,
  getPaymentsByUserId,
  updatePaymentStatus,
  getPaymentStats,
} = require('../controllers/paymentController');
const {
  requireAuth,
  requireAdmin,
} = require('../middleware/authMiddleware');
const { verifyBuniSignature } = require('../middleware/webhookValidation');

const router = express.Router();

// User routes
router.post('/initiate', requireAuth, initiatePayment);
router.get('/:id', requireAuth, getPaymentById);
router.get('/booking/:bookingId', requireAuth, getPaymentByBookingId);

// Webhook (validate signature)
router.post('/webhook', verifyBuniSignature, handlePaymentWebhook);

// Admin routes
router.get('/', requireAuth, requireAdmin, getAllPayments);
router.get('/user/:userId', requireAuth, requireAdmin, getPaymentsByUserId);
router.patch('/:id/status', requireAuth, requireAdmin, updatePaymentStatus);
router.get('/stats/overview', requireAuth, requireAdmin, getPaymentStats);

module.exports = router;