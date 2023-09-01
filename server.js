const express = require('express')
const bodyParser = require('body-parser')
const router = require('./routes/index.js')

const app = express()
app.use(bodyParser({ extended: false }))

const port = process.env.PORT || 5000

app.use(router)

app.listen(port, 'localhost', () => {
	console.log(`Server running on port ${port}`)
})

module.exports = app
