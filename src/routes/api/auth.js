const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const asyncHandler = require('../../middleware/async')
const ErrorResponse = require('../../utils/errorResponse')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// @route   GET api/auth
// @desc    Get user by token
// @access  Private
router.get(
  '/',
  auth,
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password')
    // const socket = req.app.get('socket')
    // socket.emit('test', { user: user })
    res.status(200).json({
      success: true,
      user: user
    })
  })
)

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array(), 400))
    }

    const { email, password } = req.body

    let user = await User.findOne({ email }).select('+password')

    // Check if user exists
    if (!user) {
      return next(new ErrorResponse(`Invalid credentials.  - bb`, 400))
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return next(new ErrorResponse(`Invalid credentials  - bb`, 400))
    }

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
        res.status(200).json({ success: true, token: token })
      }
    )
  })
)

module.exports = router
