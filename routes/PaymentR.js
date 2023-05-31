const express = require('express');
const router = express.Router();
const { protect, authorize, isSiteOwner } = require('../middlewares/auth');

// import controllers
const { capturePayment, verifySignature } = require('../controllers/PaymentC');

router.post('/capturePayment', protect, authorize('Student'), capturePayment);
router.post('/verifySignature', protect, authorize('Student'), verifySignature);

module.exports = router;
