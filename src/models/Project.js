const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  desc: {
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
      name: {
        type: String
      }
    }
  ],
  libraries: [
    {
      name: {
        type: String
      }
    }
  ],
  team: [
    {
      name: {
        type: String
      },
      position: {
        type: String
      }
    }
  ]
})

module.exports = mongoose.model('project', ProjectSchema)
