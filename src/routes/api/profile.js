const express = require('express')
const axios = require('axios')
const config = require('config')
const router = express.Router()
const auth = require('../../middleware/auth')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const capitalizeFirstLetter = require('../../utils/capitalizeFirstLetter')
const salt = require('../../utils/salt')
const User = require('../../models/User')

// @route    GET api/profile
// @desc     Get current user profile and update it
// @access   Private
router.put('/update', auth, async (req, res) => {
  try {
    let { firstName, lastName, email, password, oldPassword } = req.body
    if (firstName && firstName.length !== 0) {
      firstName = capitalizeFirstLetter(firstName)
    }
    if (lastName && lastName.length !== 0) {
      lastName = capitalizeFirstLetter(lastName)
    }

    const filter = { _id: req.body.filterById }

    if (password) {
      const currentPassword = await User.findById(filter).select('password')

      const validPassword = await bcrypt.compare(
        oldPassword,
        currentPassword.password
      )

      if (validPassword) {
        const salted = await salt()
        password = await bcrypt.hash(password, salted)
        console.log('PASSSOWRD UPDATED')
      } else {
        console.log('NOT WORKING')
      }
    }

    const user = await User.findOneAndUpdate(
      filter,
      {
        firstName,
        lastName,
        password,
        email
      },
      {
        new: true
      }
    ).select('-password')

    if (!user) {
      return res.status(400).json({ msg: 'There is no profile for this user' })
    }

    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
