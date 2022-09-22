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
        user: config.get('uOFFICE_MAIL'),
        pass: config.get('pOFFICE_MAIL')
      }
    })

    await transporter.sendMail({
      from: config.get('uOFFICE_MAIL'),
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
