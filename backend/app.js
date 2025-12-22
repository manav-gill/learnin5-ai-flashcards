const express = require('express')
const app = express()
const flashcardrouter = require('./flashcardrouter')
const path = require('path')


// define middleware
app.use(express.json())
app.use(express.static(path.join(__dirname , '..' , 'frontend')))

// use routers
app.use('/api/flashcards' , flashcardrouter )

// send html file
app.get('/learnin5', (req, res) => {
  res.sendFile(path.join(__dirname ,'..' , 'frontend' , 'index.html'))
})

module.exports = app