const mongoose = require('mongoose')
const config = require('config')
const env = require('dotenv').config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongoURI, {
      useNewUrlParser: true
    })
    console.log('MongoDB Connected...')
  } catch (err) {
    console.error(err.message)
    // Exit process with failure
    process.exit(1)
  }
}

module.exports = connectDB
