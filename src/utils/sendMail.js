const { text } = require('express')
const nodemailer = require('nodemailer')
const config = require('config')

const sendMail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      secure: true,
      port: 465,
      auth: {
        user: process.env.uOFFICE_MAIL,
        pass: process.env.pOFFICE_MAIL
      }
    })

    await transporter.sendMail({
      from: process.env.uOFFICE_MAIL,
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
