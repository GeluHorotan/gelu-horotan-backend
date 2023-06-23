const mongoose = require('mongoose')
const config = require('config')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const connectDB = async () => {
  const startTime = new Date()
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: poolSize
    })
    const endTime = new Date()
    console.log(`MongoDB Connected in ${endTime - startTime}ms`)
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

module.exports = connectDB
