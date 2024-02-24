const express = require('express')
const connectDB = require('../config/db')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const errorHandler = require('./middleware/error')
var colors = require('colors')
colors.enable()
const app = express()
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000

// Connect Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('listening for requests')
  })
})

// Cors

var corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions))
// Express 4.0
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))

// Init Middleware
app.use(express.json({ extended: false }))

app.get('/', (req, res) => res.send('API Running'))

// Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/projects', require('./routes/api/projects'))
app.use('/api/contact', require('./routes/api/contact'))
app.use(
  fileUpload({
    useTempFiles: true
  })
)

app.use(errorHandler)
