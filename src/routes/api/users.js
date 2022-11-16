const express = require('express')
const sendEmail = require('../../utils/sendMail')
const capitalizeFirstLetter = require('../../utils/capitalizeFirstLetter')
const salt = require('../../utils/salt')
const router = express.Router()
require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')

// Models
const User = require('../../models/User')
const UserVerification = require('../../models/UserVerification')

// @route   POST api/users
// @desc    Register user
// @access  Public

router.post(
  '/',
  check('firstName', 'Please include a valid first name').notEmpty(),
  check('lastName', 'Please include a valid last name').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    let { firstName, lastName, email, password } = req.body

    try {
      let user = await User.findOne({ email })

      // Check if user exists
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] })
      }
      firstName = capitalizeFirstLetter(firstName)
      lastName = capitalizeFirstLetter(lastName)

      user = new User({
        firstName,
        lastName,
        email,
        password
      })

      // Encrypt password
      const salted = await salt()
      user.password = await bcrypt.hash(password, salted)

      // Save user to DB
      await user.save()

      // Generate mail verification token and sending it
      let token = await new UserVerification({
        userId: user._id,
        token: uuidv4()
      }).save()
      const message = `${process.env.BASE_URL}/users/verify/${user.id}/${token.token}`
      await sendEmail(user.email, 'Verify Email', message)

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        process.env.jwtSecret,
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      )
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

router.get('/verify/:id/:token', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
    if (!user) return res.status(400).send('Invalid link')

    const token = await UserVerification.findOne({
      userId: user._id,
      token: req.params.token
    })
    if (!token) return res.status(400).send('Invalid link')

    await User.updateOne({ _id: user._id, verified: true })
    await UserVerification.findByIdAndRemove(token._id)

    res.send('email verified sucessfully')
  } catch (err) {
    console.error(err.message)
    res.status(400).send('An error occured')
  }
})

module.exports = router
