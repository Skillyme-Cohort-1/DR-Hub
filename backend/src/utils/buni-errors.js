// Custom Buni Error Classes

class BuniAPIError extends Error {
  constructor(message, code = 'BUNI_ERROR') {
    super(message);
    this.name = 'BuniAPIError';
    this.code = code;
  }
}

class BuniWebhookError extends Error {
  constructor(message, code = 'WEBHOOK_ERROR') {
    super(message);
    this.name = 'BuniWebhookError';
    this.code = code;
  }
}

class BuniSignatureError extends Error {
  constructor(message = 'Invalid webhook signature') {
    super(message);
    this.name = 'BuniSignatureError';
    this.code = 'INVALID_SIGNATURE';
  }
}

module.exports = {
  BuniAPIError,
  BuniWebhookError,
  BuniSignatureError,
};
