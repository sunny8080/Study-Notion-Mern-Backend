const nodemailer = require('nodemailer');
const clgDev = require('./clgDev');

const emailSender = async (toEmail, subject, body) => {
  try {
    // For real purpose 
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // // For testing / development purpose
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   auth: {
    //     user: process.env.SMTP_EMAIL,
    //     pass: process.env.SMTP_PASSWORD,
    //   },
    // });

    // send mail
    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME} | sunny8080 <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: subject,
      html: body,
    });

    return info;
  } catch (err) {
    clgDev(err.message);
    throw err;
  }
};

module.exports = emailSender;
