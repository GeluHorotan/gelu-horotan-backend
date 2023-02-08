const mongoose = require('mongoose')
const { Role } = require('../utils/roles')

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add your first name.']
  },
  lastName: {
    type: String,
    required: [true, 'Please add your last name.']
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email.'
    ]
  },
  role: {
    type: Number,
    default: Role.User
  },
  password: {
    type: String,
    required: [true, 'Please add a password.'],
    minlength: 6,
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: 'nothing'
  },
  createdAt: {
    type: Date,
    default: function () {
      return Date.now() + 60 * 60 * 1000
    }
  }
})

module.exports = mongoose.model('user', UserSchema)
