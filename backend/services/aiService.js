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
  `Generate exactly 5 flashcards about: ${topic}.\n` +
  `Return ONLY valid JSON. Do not include explanations or text outside JSON.\n` +
  `Use this format:\n` +
  `[\n` +
  `  {\n` +
  `    "title": "...",\n` +
  `    "explanation": "...",\n` +
  `    "keyPoints": ["...", "..."],\n` +
  `    "example": "...",\n` +
  `    "quiz": "..."\n` +
  `  }\n` +
  `]`
);

export const fetchRawFlashcardResponse = async (topic) => {
  const openai = getOpenAIClient();

  try {
    const cacheKey = topic.trim().toLowerCase();
    console.log("Requesting flashcards from OpenAI", { topic: cacheKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You create beginner-friendly educational flashcards. Return ONLY valid JSON. Do not include explanations or text outside JSON.",
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
