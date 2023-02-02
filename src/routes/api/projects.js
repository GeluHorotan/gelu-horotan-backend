const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')
const cloudinary = require('cloudinary').v2
const Project = require('../../models/Project')
const User = require('../../models/User')

// @route    POST api/projects
// @route    POST api/projects
// @desc     Create a project
// @access   Private
router.post(
  '/',
  auth,
  check('fullProjectName', 'Project name is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const user = await User.findById(req.user.id).select('-password')
      let mobileImage, headerImage, galleryImages

      await cloudinary.uploader.upload(
        req.body.images.mobile,
        {
          resource_type: 'image',
          folder: `Projects/${req.body.fullProjectName}/mobile`,
          public_id: 'mobileImage'
        },
        (err, result) => {
          if (err) {
            console.log(err)
            return
          }
          mobileImage = result.secure_url
        }
      )
      await cloudinary.uploader.upload(
        req.body.images.header,
        {
          resource_type: 'image',
          folder: `Projects/${req.body.fullProjectName}/header`,
          public_id: 'headerImage'
        },
        (err, result) => {
          if (err) {
            console.log(err)
            return
          }
          headerImage = result.secure_url
        }
      )
      req.body.images.gallery.forEach(async image => {
        await cloudinary.uploader.upload(
          image,
          {
            resource_type: 'image',
            folder: `Projects/${req.body.fullProjectName}/gallery`,
            public_id: `galleryImage${Date.now()}`
          },
          (err, result) => {
            if (err) {
              console.log(err)
              return
            }
            galleryImages.push(result.secure_url)
          }
        )
      })

      let projectImages = {
        mobile: mobileImage,
        header: headerImage,
        gallery: galleryImages
      }

      const newProject = new Project({
        fullProjectName: req.body.fullProjectName,
        url: req.body.url,
        desc: req.body.desc,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        abbreviation: req.body.abbreviation,
        team: req.body.team,
        technologies: req.body.technologies,
        images: projectImages
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
