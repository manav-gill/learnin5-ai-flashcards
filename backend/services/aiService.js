import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env.js";

let geminiClient = null;
const GEMINI_MODEL = "gemini-2.5-flash";

const getGeminiClient = () => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment variables");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  return geminiClient;
};

const getGeminiModel = () => {
  const client = getGeminiClient();

  return client.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
};

const buildPrompt = (topic) => (
  `Generate exactly 5 flashcards for the topic: ${topic}.\n\n` +
  `Return ONLY a valid JSON array in this exact format:\n\n` +
  `[\n` +
  `  {\n` +
  `    "title": "string",\n` +
  `    "explanation": "string",\n` +
  `    "keyPoints": ["string", "string"],\n` +
  `    "example": "string",\n` +
  `    "quiz": "string"\n` +
  `  }\n` +
  `]\n\n` +
  `Return ONLY valid JSON. Do not include any text outside JSON.`
);

export const fetchRawFlashcardResponse = async (topic) => {
  const model = getGeminiModel();
  const cacheKey = topic.trim().toLowerCase();
  console.log("Requesting flashcards from Gemini", { topic: cacheKey });

  try {
    const prompt = buildPrompt(topic);
    const result = await model.generateContent(prompt);
    const rawText = result?.response?.text?.();
    return typeof rawText === "string" ? rawText.trim() : "";
  } catch (error) {
    console.error("Gemini request failed", {
      model: GEMINI_MODEL,
      message: error?.message || "Unknown Gemini error",
      status: error?.status || error?.code || null,
      providerPayload: error?.response || error?.errorDetails || error?.details || null,
      stack: error?.stack,
    });
    throw error;
  }
};
