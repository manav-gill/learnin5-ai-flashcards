require('dotenv').config()
const { GoogleGenAI } = require('@google/genai')

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})
async function generateFlashcards(topic) {
  const content = `You are an educational assistant.

Generate flashcards ONLY for academic or study-related topics.
If the topic is not related to education, computer science, engineering, or academics,
respond with exactly this sentence:

"INVALID_TOPIC"

Topic: "${topic}"

Rules:
- Create exactly 5 flashcards
- Use Q: and A: format
- No extra text
,
"INVALID_TOPIC"

Topic: "${topic}"

Rules:
- Create exactly 5 flashcards
- Use Q: and A: format
- No extra text
`
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: content,
  maxOutputTokens: 500,
  temperature: 0.7
})

return response.text.trim()
}
module.exports = { generateFlashcards }
