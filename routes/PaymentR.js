const express = require('express');
const router = express.Router();
const { protect, authorize, isSiteOwner } = require('../middlewares/auth');

// import controllers
const { createOrder, sendPaymentSuccess, verifyPaymentSignature } = require('../controllers/PaymentC');

router.post('/createorder', protect, authorize('Student'), createOrder);
router.post('/sendpaymentsuccess', protect, authorize('Student'), sendPaymentSuccess);
router.put('/verifypaymentsignature', protect, authorize('Student'), verifyPaymentSignature);

module.exports = router;
