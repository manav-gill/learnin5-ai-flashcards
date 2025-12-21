const express = require('express')
const router = express.Router()

const {createFlashcards} = require('./flashcardcontrllor')

router.post('/', createFlashcards)

module.exports = router