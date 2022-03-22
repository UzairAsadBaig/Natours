const nodemailer = require('nodemailer');

module.exports = async function (options) {
  //Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: 'Uzair <uzairasad26@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  //It is an asynchronous function and return a promise so we should await it
  await transporter.sendMail(mailOptions);
};
