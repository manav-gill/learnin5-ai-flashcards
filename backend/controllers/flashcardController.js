import { getFlashcardTestMessage } from "../services/flashcardService.js";
import { generateFlashcardsForTopic } from "../services/flashcardService.js";
import SavedFlashcard from "../models/SavedFlashcard.js";
import { buildFallbackFlashcards } from "../utils/parseFlashcards.js";

export const getFlashcardTest = (req, res) => {
  res.send(getFlashcardTestMessage());
};

const validateTopic = (topic) => {
  if (typeof topic !== "string" || !topic.trim()) {
    return { isValid: false, message: "Topic is required" };
  }

  return { isValid: true, cleanTopic: topic.trim() };
};

export const generateFlashcard = async (req, res) => {
  console.log("Incoming generate flashcards request body", req.body || {});

  try {
    const { topic } = req.body || {};
    const validation = validateTopic(topic);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const flashcards = await generateFlashcardsForTopic(validation.cleanTopic);

    return res.status(200).json({
      success: true,
      flashcards,
    });
  } catch (error) {
    console.error("Error in generateFlashcard", {
      message: error?.message || "Unknown error",
      stack: error?.stack,
      topic: req.body?.topic,
      error,
    });

    return res.status(200).json({
      success: true,
      flashcards: buildFallbackFlashcards(),
    });
  }
};

export const saveFlashcards = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { topic, flashcards } = req.body || {};

    const validation = validateTopic(topic);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        data: null,
      });
    }

    if (!Array.isArray(flashcards)) {
      return res.status(400).json({
        success: false,
        data: null,
      });
    }

    const savedFlashcard = await SavedFlashcard.create({
      userId,
      topic: validation.cleanTopic,
      flashcards,
    });

    return res.status(201).json({
      success: true,
      data: savedFlashcard,
    });
  } catch (error) {
    console.error("Error in saveFlashcards:", error);

    return res.status(500).json({
      success: false,
      data: null,
    });
  }
};

export const getMyFlashcards = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const savedFlashcards = await SavedFlashcard.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: savedFlashcards,
    });
  } catch (error) {
    console.error("Error in getMyFlashcards:", error);

    return res.status(500).json({
      success: false,
      data: null,
    });
  }
};
