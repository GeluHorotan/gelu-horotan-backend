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
  githubRepo: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  domain: {
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
    header: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: function () {
      return Date.now()
    }
  }
})

module.exports = mongoose.model('project', ProjectSchema)
