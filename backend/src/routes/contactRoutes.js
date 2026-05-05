const express = require('express');
const { submitContactForm, getAllMessages } = require('../controllers/contactController');
const { 
  requireAuth, 
  requireAdmin 
} = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/', getAllMessages)
router.post('/', submitContactForm);


module.exports = router;
