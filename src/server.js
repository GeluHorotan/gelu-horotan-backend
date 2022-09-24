const express = require('express')
const connectDB = require('../config/db')
const cors = require('cors')

const app = express()

// Connect Database
connectDB()

// Cors
const whitelist = ['http://localhost:8888', 'https://geluhorotan.com/']
var corsOptions = {
  origin: whitelist,
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
