const { text } = require('express')
const nodemailer = require('nodemailer')
require('dotenv').config()
const env = process.env

const sendMail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      secure: true,
      port: 465,
      auth: {
        user: env.uOFFICE_MAIL,
        pass: env.pOFFICE_MAIL
      }
    })

    await transporter.sendMail({
      from: env.uOFFICE_MAIL,
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
