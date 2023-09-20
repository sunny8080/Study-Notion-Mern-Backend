const express = require('express');
const router = express.Router();
const { protect, authorize, isSiteOwner } = require('../middlewares/auth');

// import controllers
const { capturePayment, verifySignature, addDirectCourse } = require('../controllers/PaymentC');

router.post('/capturepayment', protect, authorize('Student'), capturePayment);
router.post('/verifysignature', protect, authorize('Student'), verifySignature);
router.put('/adddirectcourse', protect, authorize('Student'), addDirectCourse);

module.exports = router;
