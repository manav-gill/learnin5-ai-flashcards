import { getFlashcardTestMessage } from "../services/flashcardService.js";
import { getFlashcardsFromAI } from "../services/aiService.js";

export const getFlashcardTest = (req, res) => {
  res.send(getFlashcardTestMessage());
};

const validateTopic = (topic) => {
  if (typeof topic !== "string") {
    return { isValid: false, message: "Topic must be a string" };
  }

  const cleanTopic = topic.trim();

  if (!cleanTopic) {
    return { isValid: false, message: "Topic is required" };
  }

  if (cleanTopic.length < 3) {
    return { isValid: false, message: "Topic must be at least 3 characters" };
  }

  return { isValid: true, cleanTopic };
};

export const generateFlashcard = (req, res) => {
  try {
    const { topic } = req.body || {};
    const validation = validateTopic(topic);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const flashcards = getFlashcardsFromAI(validation.cleanTopic);

    return res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    console.error("Error in generateFlashcard:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating flashcard",
    });
  }
};
