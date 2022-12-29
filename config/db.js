const mongoose = require('mongoose')
const config = require('config')
// TEST
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI, {
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
