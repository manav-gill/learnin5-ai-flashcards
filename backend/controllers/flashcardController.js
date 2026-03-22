import { getFlashcardTestMessage } from "../services/flashcardService.js";

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

    const cleanTopic = topic.trim();

    const flashcard = {
      title: `${cleanTopic} Basics`,
      explanation: `This flashcard introduces the core idea of ${cleanTopic}.`,
      points: [
        `${cleanTopic} has a clear definition.`,
        `${cleanTopic} is easier when learned with examples.`,
        `Practice helps you understand ${cleanTopic} deeply.`,
      ],
      example: `Example: Start with one small ${cleanTopic} concept and apply it in a mini project.`,
      quiz: `What is one key reason ${cleanTopic} is useful?`,
    };

    return res.status(200).json({
      success: true,
      count: 1,
      data: flashcard,
    });
  } catch (error) {
    console.error("Error in generateFlashcard:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating flashcard",
    });
  }
};
