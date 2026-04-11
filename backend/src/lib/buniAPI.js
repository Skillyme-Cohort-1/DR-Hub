// Buni API Client/Wrapper

const BUNI_CONFIG = require('../config/buni');
const { BuniAPIError } = require('../utils/buni-errors');

// Initialize payment with Buni API
exports.initializePayment = async (paymentId, amount, currency) => {
  try {
    if (!BUNI_CONFIG.API_KEY) {
      throw new BuniAPIError('Buni API key not configured');
    }

    // TODO: Implement actual Buni API call
    // const response = await fetch(`${BUNI_CONFIG.API_BASE_URL}/payments/initialize`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${BUNI_CONFIG.API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     paymentId,
    //     amount,
    //     currency,
    //     callbackUrl: `${process.env.APP_URL}/api/payments/webhook`,
    //   }),
    //   timeout: BUNI_CONFIG.REQUEST_TIMEOUT,
    // });
    //
    // if (!response.ok) {
    //   const error = await response.json();
    //   throw new BuniAPIError(error.message, error.code);
    // }
    //
    // const data = await response.json();
    // return { paymentUrl: data.paymentUrl, transactionId: data.transactionId };

    // Mock response for now
    return {
      paymentUrl: '/mock-payment-page',
      transactionId: `BUNI_${paymentId}`,
    };
  } catch (error) {
    if (error instanceof BuniAPIError) {
      throw error;
    }
    throw new BuniAPIError(`Failed to initialize payment: ${error.message}`);
  }
};

// Verify payment status with Buni
exports.verifyPaymentStatus = async (transactionId) => {
  try {
    // TODO: Implement Buni API call to verify payment status
    // const response = await fetch(`${BUNI_CONFIG.API_BASE_URL}/payments/${transactionId}/status`, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${BUNI_CONFIG.API_KEY}`,
    //   },
    //   timeout: BUNI_CONFIG.REQUEST_TIMEOUT,
    // });
    //
    // if (!response.ok) {
    //   throw new BuniAPIError('Failed to verify payment status');
    // }
    //
    // return await response.json();

    // Mock response
    return { status: 'COMPLETED', transactionId };
  } catch (error) {
    if (error instanceof BuniAPIError) {
      throw error;
    }
    throw new BuniAPIError(`Failed to verify payment: ${error.message}`);
  }
};

// Refund payment
exports.refundPayment = async (transactionId, amount) => {
  try {
    // TODO: Implement Buni refund API call
    // const response = await fetch(`${BUNI_CONFIG.API_BASE_URL}/payments/${transactionId}/refund`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${BUNI_CONFIG.API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ amount }),
    //   timeout: BUNI_CONFIG.REQUEST_TIMEOUT,
    // });
    //
    // if (!response.ok) {
    //   throw new BuniAPIError('Failed to process refund');
    // }
    //
    // return await response.json();

    return { success: true, refundId: `REF_${transactionId}` };
  } catch (error) {
    if (error instanceof BuniAPIError) {
      throw error;
    }
    throw new BuniAPIError(`Failed to refund payment: ${error.message}`);
  }
};
