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
  [check('fullProjectName', 'Project name is required!').notEmpty()],
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array(), 400))
    }

    let headerImage,
      galleryImages = []

    try {
      if (req.body.images.header) {
        const headerResult = await cloudinary.uploader.upload(
          req.body.images.header,
          {
            resource_type: 'image',
            folder: `Projects/${req.body.fullProjectName}/header`,
            public_id: 'headerImage'
          }
        )
        headerImage = headerResult.secure_url
      }

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

      galleryImages = await Promise.all(uploadPromises)
    } catch (error) {
      console.log(error)
      return next(new ErrorResponse('Error uploading images', 500))
    }

    try {
      const projectImages = {
        header: headerImage,
        gallery: galleryImages
      }

      const newProject = new Project({
        fullProjectName: req.body.fullProjectName,
        githubUrl: req.body.githubUrl,
        linesOfCode: req.body.linesOfCode,
        keyHighlights: req.body.keyHighlights,
        conceptsCovered: req.body.conceptsCovered,
        url: req.body.url,
        domain: req.body.domain,
        desc: req.body.desc,

        team: req.body.team,
        technologies: req.body.technologies,
        images: projectImages
      })

      const createdProject = await newProject.save()

      res.status(200).json({ success: true, project: createdProject })
    } catch (error) {
      console.log(error)
      return next(new ErrorResponse('Error creating project', 500))
    }
  })
)

// @route    GET api/projects
// @desc     Get all projects
router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const projects = await Project.find({}).sort({ createdAt: -1 })

    if (projects.length === 0) {
      return next(
        new ErrorResponse(
          `We're sorry, but we couldn't find the resource!`,
          404
        )
      )
    }

    res.status(200).json({
      success: true,
      projects: projects
    })
  })
)

module.exports = router
