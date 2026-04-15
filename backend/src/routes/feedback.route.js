
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');


router.post('/', feedbackController.createFeedback);


router.get('/booking', feedbackController.getFeedbackByBooking);
router.get('/booking/:bookingId', feedbackController.getFeedbackByBooking);


router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;