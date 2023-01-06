const express = require('express')
const router = express.Router()
const sendEmail = require('../../utils/sendMail')
const capitalizeFirstLetter = require('../../utils/capitalizeFirstLetter')
const salt = require('../../utils/salt')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const cloudinary = require('cloudinary').v2
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')

// Models
const User = require('../../models/User')
const UserVerification = require('../../models/UserVerification')

// Cloudinary Connection
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

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

    let { firstName, lastName, email, password, profilePicture } = req.body

    const base64URL = profilePicture
    const file = base64URL

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
      let imageUrl
      await cloudinary.uploader.upload(
        file,
        {
          resource_type: 'image',
          folder: 'Profile Pictures'
        },
        (err, result) => {
          if (err) {
            console.log(err)
            return
          }
          imageUrl = result.secure_url
        }
      )

      user = new User({
        firstName,
        lastName,
        email,
        profilePicture: imageUrl,
        password
      })

      // Encrypt password
      const salted = await salt()
      user.password = await bcrypt.hash(password, salted)

      // Save user to DB
      await user.save()

      // Generate mail verification token and sending it
      // let token = await new UserVerification({
      //   userId: user._id,
      //   token: uuidv4()
      // }).save()
      // const message = `${process.env.BASE_URL}/users/verify/${user.id}/${token.token}`
      // await sendEmail(user.email, 'Verify Email', message)

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        process.env.JWTSECRET,
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

// @route GET api/users
// @desc Get all users
// @access Private - Admin Level
router.get('/', async (req, res) => {
  const roleQuery = req.query.filterByRole

  try {
    const users = await User.find({ role: { $gte: roleQuery } })
    res.json(users)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

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
