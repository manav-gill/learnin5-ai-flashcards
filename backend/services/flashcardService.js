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

const hasValidFlashcardShape = (item) => {
  if (!item || typeof item !== "object") {
    return false;
  }

  const hasExplanation = typeof item.explanation === "string" && item.explanation.trim().length > 0;
  const hasKeyPoints = Array.isArray(item.keyPoints) && item.keyPoints.every((value) => typeof value === "string");
  const hasExample = typeof item.example === "string" && item.example.trim().length > 0;
  const hasQuiz = typeof item.quiz === "string" && item.quiz.trim().length > 0;

  return hasExplanation && hasKeyPoints && hasExample && hasQuiz;
};

const ensureSchemaShape = (flashcards) => flashcards.map((item) => {
  const normalizedKeyPoints = Array.isArray(item?.keyPoints)
    ? item.keyPoints.filter((value) => typeof value === "string" && value.trim())
    : [];

  while (normalizedKeyPoints.length < 2) {
    normalizedKeyPoints.push("Point not available.");
  }

  const safeKeyPoints = normalizedKeyPoints.slice(0, 2);

  return {
    title: typeof item?.title === "string" && item.title.trim()
      ? item.title.trim()
      : "Flashcard",
    explanation: typeof item?.explanation === "string" && item.explanation.trim()
      ? item.explanation.trim()
      : "Explanation unavailable.",
    keyPoints: safeKeyPoints,
    points: safeKeyPoints,
    example: typeof item?.example === "string" && item.example.trim()
      ? item.example.trim()
      : "Example unavailable.",
    quiz: typeof item?.quiz === "string" && item.quiz.trim()
      ? item.quiz.trim()
      : "Quiz unavailable.",
  };
});

const hasValidFlashcardOutput = (flashcards) => (
  Array.isArray(flashcards)
  && flashcards.length === REQUIRED_COUNT
  && flashcards.every((item) => hasValidFlashcardShape(item))
);

export const generateFlashcardsForTopic = async (topic) => {
  try {
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
      console.error("AI call failed, switching to fallback flashcards", {
        topic: cacheKey,
        message: error?.message || "Unknown error",
        stack: error?.stack,
      });
    }

    console.log("AI raw response", {
      topic: cacheKey,
      response: rawResponse,
    });

    let parsedFlashcards = [];

    try {
      parsedFlashcards = parseFlashcards(rawResponse);
    } catch (error) {
      console.error("Flashcard parsing failed, using fallback flashcards", {
        topic: cacheKey,
        message: error?.message || "Unknown parse error",
        stack: error?.stack,
      });
      parsedFlashcards = buildFallbackFlashcards();
    }

    if (!hasValidFlashcardOutput(parsedFlashcards)) {
      console.error("Parsed flashcards invalid shape, using fallback flashcards", {
        topic: cacheKey,
        parsedCount: Array.isArray(parsedFlashcards) ? parsedFlashcards.length : 0,
      });
      parsedFlashcards = buildFallbackFlashcards();
    }

    parsedFlashcards = ensureSchemaShape(parsedFlashcards);

    console.log("Parsed flashcards output", {
      topic: cacheKey,
      flashcards: parsedFlashcards,
    });

    setCache(cacheKey, parsedFlashcards, CACHE_TTL_MS);
    return parsedFlashcards;
  } catch (error) {
    console.error("generateFlashcardsForTopic failed, returning fallback flashcards", {
      topic,
      message: error?.message || "Unknown service error",
      stack: error?.stack,
    });
    return buildFallbackFlashcards();
  }
};
