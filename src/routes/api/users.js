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

    let {
      firstName,
      lastName,
      email,
      password,
      profilePicture,
      termsAndConditions
    } = req.body

    const base64URL = profilePicture
    const file = base64URL

    let user = await User.findOne({ email })

    // Check if user exists
    if (user) {
      return next(new ErrorResponse(`This user already exists!`, 400))
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
      password,
      termsAndConditions
    })

    // Encrypt password
    const salted = await salt()
    user.password = await bcrypt.hash(password, salted)

    // Save user to DB
    await user.save()
    const registerMessage = `
<html>
  <head>
    <style>
      .button {
        background-color: #4caf50; /* Green */
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
      }
      #firstName {
        font-weight: 700;
      }
      #socials {
        display: flex;
        flex-direction:row;
        
        
      }
    </style>
  </head>
  <body>
    <h3>Thank You for Connecting! Let's Make Amazing Things Happen.</h3>
    <p>Hi <span id="firstName">${user.firstName}</span>,</p>
    <p>
      Thank you for visiting my personal portfolio platform and connecting with
      me. I'm excited to have the opportunity to showcase my skills, projects,
      and experiences to potential recruiters like yourself.
    </p>
    <p>
      On my portfolio, you'll find detailed information about my background,
      qualifications, and the work I've done. Feel free to explore my projects
      and learn more about my expertise.
    </p>
    <p>
      If you have any questions or would like to discuss potential
      collaborations, please don't hesitate to reach out to me. I'm eager to
      learn more about your company and how I can contribute to its success.
    </p>
    <p>
      Please note that this email was sent from a no-reply address, so I won't
      be able to respond to any replies. However, I encourage you to visit my
      portfolio website for further information and to get in touch with me.
    </p>
    <p>
      Let's work together to create remarkable things and make a positive impact
      in the industry. I look forward to the possibility of working with you!
    </p>
    <p>Thank you again for your interest and support.</p>
    <p>
      Best Regards,<br />
      Gelu Horotan!
    </p>
    <h4>Socials:</h4>
  <a href="https://github.com/GeluHorotan" target="_blank" rel="noopener noreferrer">
   
    Github
  </a>
 <br/>
  <a href="https://www.linkedin.com/in/gelu-horotan/" target="_blank" rel="noopener noreferrer">

    LinkedIn
  </a>
   <br/>
  <a href="https://twitter.com/oxymoron365" target="_blank" rel="noopener noreferrer">

    Twitter
  </a>
   <br/>
  <a href="https://geluhorotan.com/" target="_blank" rel="noopener noreferrer">
     

  Portfolio
  </a>

  </body>
</html>
`

    await sendEmail(
      process.env.NOREPLY_MAIL_USERNAME,
      user.email,
      'Thank you for joining our club!',
      registerMessage
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
        res.status(200).json({
          success: true,
          msg: 'User created successfully!',
          token: token
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
        new ErrorResponse(
          `We're sorry, but we couldn't find the resource what with the id of ${roleQuery}!`,
          400
        )
      )
    }
    res.status(200).json({ success: true, users: users })
  })
)

module.exports = router
