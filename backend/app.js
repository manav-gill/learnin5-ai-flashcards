const express = require('express')
const app = express()
const flashcardrouter = require('./flashcardrouter')

// define middleware
app.use(express.json())

// use routers
app.use('/api/flashcards' , flashcardrouter )

// define apis




module.exports = app