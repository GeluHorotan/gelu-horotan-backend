const { text } = require('express')
const nodemailer = require('nodemailer')
const config = require('config')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const sendMail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      secure: true,
      port: 465,
      auth: {
        user: process.env.OFFICE_MAIL_USERNAME,
        pass: process.env.OFFICE_MAIL_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.OFFICE_MAIL_USERNAME,
      to: email,
      subject: subject,
      text: text
    })

    console.log('email sent succesfully')
  } catch (error) {
    console.log('email not sent')
    console.log(error)
  }
}

module.exports = sendMail
