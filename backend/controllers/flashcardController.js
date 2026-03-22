import { getFlashcardTestMessage } from "../services/flashcardService.js";
import { getFlashcardsFromAI } from "../services/aiService.js";

export const getFlashcardTest = (req, res) => {
  res.send(getFlashcardTestMessage());
};

const validateTopic = (topic) => {
  if (typeof topic !== "string") {
    return "Topic must be a string";
  }

  const cleanTopic = topic.trim();

  if (!cleanTopic) {
    return "Topic is required";
  }

  if (cleanTopic.length < 3) {
    return "Topic must be at least 3 characters";
  }

  return null;
};

export const generateFlashcard = (req, res) => {
  try {
    const topic = req.body?.topic;
    const validationError = validateTopic(topic);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const flashcards = getFlashcardsFromAI(topic);

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
