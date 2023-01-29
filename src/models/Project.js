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
  abbreviation: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: String
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
  ]
})

module.exports = mongoose.model('project', ProjectSchema)
