// Buni Webhook Validation Middleware

const BUNI_CONFIG = require('../config/buni');
const { BuniSignatureError } = require('../utils/buni-errors');

// Verify Buni webhook signature
exports.verifyBuniSignature = async (req, res, next) => {
  try {
    const buniSignature = req.headers[BUNI_CONFIG.WEBHOOK_SIGNATURE_HEADER];

    if (!buniSignature) {
      throw new BuniSignatureError('Missing webhook signature header');
    }

    // TODO: Implement actual signature verification
    // const payload = JSON.stringify(req.body);
    // const secret = BUNI_CONFIG.SECRET_KEY;
    // const expectedSignature = generateSignature(payload, secret);
    //
    // if (signature !== expectedSignature) {
    //   throw new BuniSignatureError('Signature verification failed');
    // }

    // For now, just accept it
    req.buniSignatureValid = true;
    next();
  } catch (error) {
    if (error instanceof BuniSignatureError) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error validating webhook', error: error.message });
  }
};

// Helper function to generate signature (implement when Buni API docs available)
// function generateSignature(payload, secret) {
//   const crypto = require('crypto');
//   return crypto
//     .createHmac('sha256', secret)
//     .update(payload)
//     .digest('hex');
// }
