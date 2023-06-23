const mongoose = require('mongoose')
const config = require('config')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
// TEST
const connectDB = async () => {
  const startTime = new Date()
  try {
    await mongoose.connect(process.env.MONGOURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 5
    })
    const endTime = new Date()
    console.log(`MongoDB Connected in ${endTime - startTime}ms`)
  } catch (err) {
    console.error(err)
    // Exit process with failure
    process.exit(1)
  }
}

module.exports = connectDB
