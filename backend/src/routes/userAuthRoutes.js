const express = require('express');
const {
  register,
  activateAccount,
  login,
  forgotPassword,
  resetPassword,
  updateProfile,
  getAllUsers,
  getUserById,
  getMyProfile,
  selfUserRegistration
} = require('../controllers/userAuthController');
const {
  requireAuth,
  requireAdmin,
  requireSelfOrAdmin,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/self-registration', selfUserRegistration);
router.get('/activate-account', activateAccount);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', requireAuth, getMyProfile);
router.get('/', requireAuth, requireAdmin, getAllUsers);
router.get('/:id', requireAuth, requireSelfOrAdmin, getUserById);
router.patch('/:id', requireAuth, updateProfile);

module.exports = router;
