import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config/env.js";

let openaiClient = null;

const FLASHCARD_RESPONSE_SCHEMA = {
  name: "flashcard_generation",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      flashcards: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            explanation: { type: "string" },
            keyPoints: {
              type: "array",
              minItems: 2,
              maxItems: 2,
              items: { type: "string" },
            },
            example: { type: "string" },
            quiz: { type: "string" },
          },
          required: ["title", "explanation", "keyPoints", "example", "quiz"],
        },
      },
    },
    required: ["flashcards"],
  },
};

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
  + "Return only structured JSON that matches the provided schema."
);

export const fetchRawFlashcardResponse = async (topic) => {
  const openai = getOpenAIClient();

  try {
    const cacheKey = topic.trim().toLowerCase();
    console.log("Requesting flashcards from OpenAI", { topic: cacheKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: FLASHCARD_RESPONSE_SCHEMA,
      },
      messages: [
        {
          role: "system",
          content:
            "You create beginner-friendly educational flashcards. Use only valid JSON output.",
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
    const requestId = error?.request_id || error?.headers?.["x-request-id"] || null;

    console.error("OpenAI request failed", {
      message: error?.message || "Unknown OpenAI error",
      status: error?.status || error?.response?.status || null,
      requestId,
      providerPayload,
      stack: error?.stack,
    });

    throw error;
  }
};
