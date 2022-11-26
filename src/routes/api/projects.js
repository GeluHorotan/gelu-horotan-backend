const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const Project = require('../../models/Project')
const User = require('../../models/User')

// @route    POST api/projects
// @desc     Create a project
// @access   Private
router.post(
  '/',
  auth,
  check('title', 'Title is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const user = await User.findById(req.user.id).select('-password')

      const newProject = new Project({
        title: req.body.title,
        desc: req.body.title,
        startDate: req.body.startDate
      })

      const post = await newProject.save()

      res.json(post)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
    }
  }
)

// @route    GET api/projects
// @desc     Get all projects
// @access   Private
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ startDate: -1 })
    res.json(projects)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
