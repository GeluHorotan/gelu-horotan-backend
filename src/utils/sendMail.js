const { text } = require('express')
const nodemailer = require('nodemailer')
const config = require('config')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const sendMail = async (author, recipient, title, content) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      secure: true,
      port: 465,
      auth: {
        user: author,
        pass: process.env.MAIL_PASS
      }
    })

    await transporter.sendMail({
      from: author,
      to: recipient,
      subject: title,
      // text: content
      html: content
    })

    console.log('email sent succesfully')
  } catch (error) {
    console.log('email not sent')
    console.log(error)
  }
}

module.exports = sendMail
