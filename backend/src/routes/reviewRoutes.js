const express = require('express');
const {
  getGoogleReviews,
  clearReviewsCache,
} = require('../controllers/reviewController');
const {
  requireAuth,
  requireAdmin,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Public route: Get reviews (no auth required, but can be protected if needed)
router.get('/', getGoogleReviews);

// Admin route: Clear cache (for testing/maintenance)
router.post('/cache/clear', requireAuth, requireAdmin, clearReviewsCache);

module.exports = router;
