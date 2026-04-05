import { fetchRawFlashcardResponse } from "./aiService.js";
import { getCache, setCache } from "../utils/cache.js";
import {
  buildFallbackFlashcards,
  parseFlashcards,
  REQUIRED_COUNT,
} from "../utils/parseFlashcards.js";

export const getFlashcardTestMessage = () => {
  return "Flashcard route working";
};

const CACHE_TTL_MS = 10 * 60 * 1000;

export const generateFlashcardsForTopic = async (topic) => {
  const cacheKey = topic.trim().toLowerCase();
  const cachedFlashcards = getCache(cacheKey);

  if (Array.isArray(cachedFlashcards) && cachedFlashcards.length === REQUIRED_COUNT) {
    console.log(`Serving flashcards from cache for topic: ${cacheKey}`);
    return cachedFlashcards;
  }

  let rawResponse = "";

  try {
    rawResponse = await fetchRawFlashcardResponse(topic);
  } catch (error) {
    console.error("AI call failed", error.response?.data || error.message);
    throw error; // Pass API errors up to controller to handle meaningful message
  }

  let parsedFlashcards = [];

  try {
    parsedFlashcards = parseFlashcards(rawResponse, topic);
  } catch (error) {
    console.error("Flashcard parsing completely failed, switching to fallback flashcards", error);
    parsedFlashcards = buildFallbackFlashcards();
  }

  setCache(cacheKey, parsedFlashcards, CACHE_TTL_MS);
  return parsedFlashcards;
};
