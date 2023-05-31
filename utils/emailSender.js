const nodemailer = require('nodemailer');
const clgDev = require('./clgDev');

const emailSender = async (toEmail, subject, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // send mail
    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: subject,
      html: `${body}`,
    });

    return info;
  } catch (err) {
    clgDev(err.message);
  }
};

module.exports = emailSender;
