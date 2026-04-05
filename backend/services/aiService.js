import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config/env.js";

let openaiClient = null;

const getOpenAIClient = () => {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in environment variables");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  return openaiClient;
};

const buildPrompt = (topic) => (
  `Generate exactly 5 flashcards about: ${topic}. Each flashcard must have: `
  + "title, explanation (max 40 words), keyPoints (array of exactly 2 items), example, quiz. "
  + "Return ONLY a valid JSON array and nothing else."
);

export const fetchRawFlashcardResponse = async (topic) => {
  const openai = getOpenAIClient();

  try {
    const cacheKey = topic.trim().toLowerCase();
    console.log("Requesting flashcards from OpenAI", { topic: cacheKey });

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
          content: buildPrompt(topic),
        },
      ],
    });

    return completion.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    const providerPayload = error?.response?.data || error?.error || null;

    console.error("OpenAI request failed", {
      message: error?.message || "Unknown OpenAI error",
      status: error?.status || error?.response?.status || null,
      providerPayload,
      stack: error?.stack,
    });

    throw error;
  }
};
