const mongoose = require('mongoose');
const clgDev = require('../utils/clgDev');
const emailSender = require('../utils/emailSender');
const emailOtpTemplate = require('../mail/templates/emailOtpTemplate');

const OTPSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '5m' // The document will automatically deleted after 5 minutes of its creation time
  }
});


const sendOtpEmail = async (toEmail, otp) => {
  try {
    const mailResponse = await emailSender(
      toEmail,
      "Verification Email",
      emailOtpTemplate(otp)
    )
    clgDev(`Email sent successfully : ${mailResponse.response}`)
  } catch (err) {
    clgDev(`Error occurred while sending otp : ${error.message}`)
    throw error;
  }
}


// Send otp after OTP is created // TODO
OTPSchema.post('save', async function (doc) {
  clgDev(this); // TODO
  // Only send an email when a new document is created
  // this.isNew in pre middleware
  await sendOtpEmail(this.email, this.otp);
})

module.exports = mongoose.model('OTP', OTPSchema);
