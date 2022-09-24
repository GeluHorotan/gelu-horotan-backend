const express = require('express')
const connectDB = require('../config/db')
const cors = require('cors')

const app = express()

// Connect Database
connectDB()

// Cors

const whitelist = ['http://localhost:8080', 'https://geluhorotan.com']
var corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error())
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions))

// Init Middleware
app.use(express.json({ extended: false }))

app.get('/', (req, res) => res.send('API Running'))

// Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
