// Buni API Configuration and Constants

const BUNI_CONFIG = {
  // API Endpoints
  API_BASE_URL: process.env.BUNI_API_URL || 'https://api.buni.com',
  API_KEY: process.env.BUNI_API_KEY,
  SECRET_KEY: process.env.BUNI_SECRET_KEY,

  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second

  // Payment Statuses
  PAYMENT_STATUSES: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  },

  // Currency
  CURRENCY: 'KES',

  // Webhook
  WEBHOOK_SIGNATURE_HEADER: 'buni-signature',
  WEBHOOK_TIMEOUT: 5000, // Fast response for webhook

  // Payment Limits
  MIN_AMOUNT: 100, // 100 cents = KES 1.00
  MAX_AMOUNT: 99999900, // 99999900 cents = KES 999,999.00
};

module.exports = BUNI_CONFIG;
