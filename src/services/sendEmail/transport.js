const nodemailer = require('nodemailer')

exports.transporterGmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_EMAIL_INVITATION,
    pass: process.env.GMAIL_KEY_APP
  }

})
