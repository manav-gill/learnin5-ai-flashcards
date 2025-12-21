const { generateFlashcards } = require('./aiservice')

async function createFlashcards(req, res) {
    try {
        const { topic } = req.body
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' })
        }
        console.log(req.headers['content-type'])
        console.log(req.body)
        const data = await generateFlashcards(topic)
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create flashcards' })
    }
}

module.exports = { createFlashcards }


