const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now() + 60 * 60 * 1000 // Expires in 1 hour from now
  }
})

const Token = mongoose.model('token', tokenSchema)

module.exports = Token
