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
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  keyHighlights: {
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
    default: Date.now,
    index: true // Add index option to create an index on the createdAt field
  }
})

ProjectSchema.index({ createdAt: -1 }) // Create an index on the createdAt field

module.exports = mongoose.model('project', ProjectSchema)
