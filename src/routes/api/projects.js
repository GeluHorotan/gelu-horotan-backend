const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const asyncHandler = require('../../middleware/async')
const auth = require('../../middleware/auth')
const cloudinary = require('cloudinary').v2
const Project = require('../../models/Project')
const User = require('../../models/User')
const ErrorResponse = require('../../utils/errorResponse')

// @route    POST api/projects
// @route    POST api/projects
// @desc     Create a project
// @access   Private
router.post(
  '/',
  auth,
  check('fullProjectName', 'Project name is required!').notEmpty(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array(), 400))
    }

    const user = await User.findById(req.user.id).select('-password')
    let mobileImage, headerImage
    let galleryImages = []

    req.body.images.mobile &&
      (await cloudinary.uploader.upload(
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
      ))

    req.body.images.header &&
      (await cloudinary.uploader.upload(
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
      ))

    const uploadPromises = req.body.images.gallery.map(image => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          image,
          {
            resource_type: 'image',
            folder: `Projects/${req.body.fullProjectName}/gallery`,
            public_id: `galleryImage${Date.now()}`
          },
          (err, result) => {
            if (err) {
              console.log(err)
              reject(err)
            } else {
              const img = result.secure_url
              resolve(img)
            }
          }
        )
      })
    })

    Promise.all(uploadPromises)
      .then(async galleryImages => {
        console.log(galleryImages)

        let projectImages = {
          mobile: mobileImage,
          header: headerImage,
          gallery: galleryImages
        }

        const newProject = new Project({
          fullProjectName: req.body.fullProjectName,
          githubRepo: req.body.githubRepo,
          url: req.body.url,
          domain: req.body.domain,
          desc: req.body.desc,
          abbreviation: req.body.abbreviation,
          team: req.body.team,
          technologies: req.body.technologies,
          images: projectImages
        })

        const NewProject = await newProject.save()

        res.status(200).json({ success: true, project: NewProject })
      })
      .catch(error => {
        console.log(error)
        // Handle any errors that occurred during the upload process
      })
  })
)

// @route    GET api/projects
// @desc     Get all projects
// @access   Private
router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const projects = await Project.find()

    if (!projects) {
      return next(
        new ErrorResponse(
          `We're sorry, but we couldn't find the resource!`,
          400
        )
      )
    }

    res.status(200).json({ success: true, projects: projects })
  })
)

module.exports = router
