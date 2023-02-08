const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log to console for dev
  // console.log(err.stack.red)
  // console.log(err.name)

  //   Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`
    error = new ErrorResponse(message, 404)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    msg: error.message || 'Server Error'
  })
}

module.exports = errorHandler
