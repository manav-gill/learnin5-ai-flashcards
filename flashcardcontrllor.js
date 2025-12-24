const { generateFlashcards } = require('./aiservice');

async function createFlashcards(req, res) {
  try {
    const { topic } = req.body;

    const text = await generateFlashcards(topic);

    //THIS IS THE IMPORTANT LINE THAT SENDS BACK THE RESPONSE TO FRONTEND
    res.send(text);  
  } catch (err) {
    res.status(500).send("Failed to generate flashcards");
  }
}

module.exports = { createFlashcards };

