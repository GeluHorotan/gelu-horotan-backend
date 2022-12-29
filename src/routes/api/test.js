const express = require('express')
const router = express.Router()

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.get(
  '/',

  async (req, res) => {
    res.json('This API is working.')
  }
)

module.exports = router
