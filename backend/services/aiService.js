import OpenAI from "openai";
import { parseFlashcards } from "../utils/parseFlashcards.js";
import { getCache, setCache } from "../utils/cache.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CACHE_TTL_MS = 10 * 60 * 1000;

export const getFlashcardsFromAI = async (topic) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY in environment variables");
    }

    const cacheKey = topic.trim().toLowerCase();
    const cachedFlashcards = getCache(cacheKey);

    if (cachedFlashcards) {
      console.log(`Serving flashcards from cache for topic: ${cacheKey}`);
      return cachedFlashcards;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You create beginner-friendly educational flashcards. Return only a JSON array.",
        },
        {
          role: "user",
          content: `Generate exactly 5 flashcards about: ${topic}. Each flashcard must have: title, explanation (max 40 words), points (array of exactly 2 items), example, quiz. Return ONLY a valid JSON array and nothing else.`,
        },
      ],
    });

    const rawText = completion.choices?.[0]?.message?.content ?? "";
    const flashcards = parseFlashcards(rawText);

    setCache(cacheKey, flashcards, CACHE_TTL_MS);

    return flashcards;
  } catch (error) {
    console.error("Error in getFlashcardsFromAI:", error);
    throw error;
  }
};
