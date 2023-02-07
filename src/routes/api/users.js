const express = require('express')
const router = express.Router()
const sendEmail = require('../../utils/sendMail')
const capitalizeFirstLetter = require('../../utils/capitalizeFirstLetter')
const salt = require('../../utils/salt')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const asyncHandler = require('../../middleware/async')
const ErrorResponse = require('../../utils/errorResponse')
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
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array(), 400))
    }

    let { firstName, lastName, email, password, profilePicture } = req.body

    const base64URL = profilePicture
    const file = base64URL

    let user = await User.findOne({ email })

    // Check if user exists
    if (user) {
      return next(new ErrorResponse(`User already exists.`, 400))
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
    let token = await new UserVerification({
      userId: user._id,
      token: uuidv4()
    }).save()

    const message = `<html>
  <head>
    <style>
      .button {
        background-color: #4CAF50; /* Green */
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;

        #firstName {
          font-weight: 700;
        }
      }
    </style>
  </head>
  <body>
    <h3>Verify your email address</h3>
    <p>Hi <span id="firstName">${user.firstName}</span> ,</p>
    <p>
     We hope this email finds you in high spirits! Before you can start enjoying all the fun and excitement on our platform, we just need to verify your email address. It's a quick and easy process that will ensure that you receive all important updates and notifications from us.
    </p>
    <p>
    Please note that this email was sent from a no-reply address, so we won't be able to respond to any reply. But rest assured that once you've verified your email, you'll be all set to join the party!
    </p>
    <p>Click the button below to verify your email:</p>
    <a href='${process.env.BASE_URL}/email-verification?user_id=${user.id}&verification_token=${token.token}' class="button">Verify Email</a>
    <p>
      Thanks for choosing us! We can't wait for you to join the fun.
    </p>
    <p>
      Regards,<br>
      Your Team
    </p>
  </body>
</html>`

    await sendEmail(
      process.env.NOREPLY_MAIL_USERNAME,
      user.email,
      'Verify Your Email and Join the Fun!',
      message
    )

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
        res
          .status(200)
          .json({
            success: true,
            msg: 'User created successfully.',
            data: token
          })
      }
    )
  })
)

// @route GET api/users
// @desc Get all users
// @access Private - Admin Level
router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const roleQuery = req.query.filterByRole
    const users = await User.find({ role: { $gte: roleQuery } })

    if (users.length === 0) {
      return next(
        new ErrorResponse(`Resource not found with id of ${roleQuery}`, 404)
      )
    }
    res.status(200).json({ success: true, data: users })
  })
)

// @route POST api/users/resend-email-verification
// @desc Resend email confirmation
// @access Public
router.post(
  '/resend-email-verification',
  asyncHandler(async (req, res, next) => {
    const { user_id } = req.body

    const user = await User.findOne({ _id: user_id })
    if (!user) return res.status(400).send('User not found')
    if (user.isEmailVerified)
      return next(new ErrorResponse(`User is already verified.`, 400))
    const oldToken = await UserVerification.findOne({ userId: user_id })
    if (!oldToken) return next(new ErrorResponse(`Token not found.`, 404))
    const now = new Date()
    if (now < oldToken.expiresAt)
      return next(new ErrorResponse(`A token has already been created`, 400))
    // Delete the old token
    await UserVerification.findOneAndRemove(oldToken._id)

    // Generate a new token and send the email
    const newToken = await new UserVerification({
      userId: user._id,
      token: uuidv4()
    }).save()

    const message = `<html>
  <head>
    <style>
      .button {
        background-color: #4CAF50; /* Green */
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;

        #firstName {
          font-weight: 700;
        }
      }
    </style>
  </head>
  <body>
    <h3>Verify your email address</h3>
    <p>Hi <span id="firstName">${user.firstName}</span> ,</p>
    <p>
     We hope this email finds you in high spirits! Before you can start enjoying all the fun and excitement on our platform, we just need to verify your email address. It's a quick and easy process that will ensure that you receive all important updates and notifications from us.
    </p>
    <p>
    Please note that this email was sent from a no-reply address, so we won't be able to respond to any reply. But rest assured that once you've verified your email, you'll be all set to join the party!
    </p>
    <p>Click the button below to verify your email (regenerated):</p>
    <a href='${process.env.BASE_URL}/email-verification?user_id=${user.id}&verification_token=${newToken.token}' class="button">Verify Email</a>
    <p>
      Thanks for choosing us! We can't wait for you to join the fun.
    </p>
    <p>
      Regards,<br>
      Your Team
    </p>
  </body>
</html>`

    await sendEmail(
      process.env.NOREPLY_MAIL_USERNAME,
      user.email,
      'Verify Your Email and Join the Fun!',
      message
    )

    return next(new ErrorResponse(`Verification email sent.`, 200))
  })
)

// @route POST api/users/email-verification
// @desc Mail confirmation
// @access Public
router.put(
  '/email-verification',
  asyncHandler(async (req, res, next) => {
    let { user_id, verification_token } = req.body

    const user = await User.findOne({ _id: user_id })
    if (!user) return res.json({ msg: 'Invalid link' })
    if (user.isEmailVerified)
      return next(new ErrorResponse(`User is already verified`, 400))

    const token = await UserVerification.findOne({
      userId: user._id,
      token: verification_token
    })
    if (!token) return next(new ErrorResponse(`Invalid link`, 400))

    const now = new Date()
    if (now > token.expiresAt) {
      // await UserVerification.findByIdAndRemove(token._id)
      return next(new ErrorResponse(`Token has expired.`, 400))
    }

    await User.updateOne({ _id: user._id, isEmailVerified: true })
    await UserVerification.findByIdAndRemove(token._id)

    return next(new ErrorResponse(`Email verified succesfully.`, 200))
  })
)

module.exports = router
