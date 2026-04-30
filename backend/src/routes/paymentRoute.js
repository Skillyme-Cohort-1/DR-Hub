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
  createManualPayment,
  getUserPayments,
} = require('../controllers/paymentController');
const {
  requireAuth,
  requireAdmin,
} = require('../middleware/authMiddleware');
const { verifyBuniSignature } = require('../middleware/webhookValidation');

const router = express.Router();

// User routesrouter.get('/:id', requireAuth, getPaymentById);


// Admin routes
router.get('/', requireAuth, getAllPayments);
router.get('/user/:userId', requireAuth, requireAdmin, getPaymentsByUserId);
router.patch('/:id/status', requireAuth, requireAdmin, updatePaymentStatus);
router.get('/stats/overview', requireAuth, requireAdmin, getPaymentStats);

router.post('/manual', requireAuth, requireAdmin, createManualPayment);
router.get('/my-payments', requireAuth, getUserPayments);

module.exports = router;
