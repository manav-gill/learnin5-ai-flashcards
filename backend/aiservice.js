require('dotenv').config()
const { GoogleGenAI } = require('@google/genai')

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

async function generateFlashcards(topic) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create flashcards on the topic: ${topic}`
  })

  return response.text
}

module.exports = { generateFlashcards }
