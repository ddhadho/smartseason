require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const fieldRoutes = require('./routes/fields')
const dashboardRoutes = require('./routes/dashboard')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartSeason API running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/fields', fieldRoutes)
app.use('/api/dashboard', dashboardRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})