const express = require('express');
const router = express.Router();
const { protect, authorize, isSiteOwner } = require('../middlewares/auth');

// import controllers
const { getAllReviews, getReview, createReview, deleteReview } = require('../controllers/ReviewC');

router.get('/', getAllReviews);
router.get('/:id', getReview);
router.post('/', protect, authorize('Student'), createReview);
router.delete('/:id', protect, authorize('Student', 'Admin'), deleteReview);

module.exports = router;
