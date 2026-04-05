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
    console.error("AI call failed, using fallback flashcards", {
      topic: cacheKey,
      message: error?.message || "Unknown AI error",
      details: error?.response || error?.error || null,
      stack: error?.stack,
    });
    return buildFallbackFlashcards();
  }

  console.log("AI raw response", {
    topic: cacheKey,
    response: rawResponse,
  });

  let parsedFlashcards = [];

  try {
    parsedFlashcards = parseFlashcards(rawResponse, topic);
  } catch (error) {
    console.error("Flashcard parsing failed, switching to fallback flashcards", {
      topic: cacheKey,
      message: error?.message || "Unknown parse error",
      stack: error?.stack,
    });
    parsedFlashcards = buildFallbackFlashcards();
  }

  if (!Array.isArray(parsedFlashcards) || parsedFlashcards.length !== REQUIRED_COUNT) {
    parsedFlashcards = buildFallbackFlashcards();
  }

  console.log("Parsed flashcards output", {
    topic: cacheKey,
    flashcards: parsedFlashcards,
  });

  setCache(cacheKey, parsedFlashcards, CACHE_TTL_MS);
  return parsedFlashcards;
};
