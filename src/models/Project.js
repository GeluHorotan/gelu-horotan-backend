const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
  fullProjectName: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  technologies: [
    {
      value: {
        type: String
      },
      label: {
        type: String
      }
    }
  ],

  team: [
    {
      value: {
        type: String
      },
      label: {
        type: String
      },
      profilePicture: {
        type: String
      },
      role: {
        type: String
      }
    }
  ],
  images: {
    gallery: {
      type: Array
    },
    mobile: {
      type: String
    },
    header: {
      type: String
    }
  }
})

module.exports = mongoose.model('project', ProjectSchema)
