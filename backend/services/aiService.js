import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env.js";

let geminiClient = null;

const GEMINI_MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-pro",
];

const getGeminiClient = () => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment variables");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  return geminiClient;
};

const getGeminiModel = (modelName) => {
  const client = getGeminiClient();

  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
};

const buildPrompt = (topic) => (
  `Generate exactly 5 flashcards for the topic: ${topic}\n\n` +
  `Return ONLY a JSON array in this exact format:\n\n` +
  `[\n` +
  `  {\n` +
  `    "title": "string",\n` +
  `    "explanation": "string",\n` +
  `    "keyPoints": ["string", "string", "string"],\n` +
  `    "example": "string",\n` +
  `    "quiz": "string"\n` +
  `  }\n` +
  `]\n\n` +
  `Do NOT include markdown, headings, or extra text.\n` +
  `Do NOT wrap in code blocks.`
);

export const fetchRawFlashcardResponse = async (topic) => {
  const cacheKey = topic.trim().toLowerCase();
  console.log("Requesting flashcards from Gemini", { topic: cacheKey });

  let lastError = null;

  for (const modelName of GEMINI_MODEL_CANDIDATES) {
    const model = getGeminiModel(modelName);

    try {
      const prompt = buildPrompt(topic);
      const result = await model.generateContent(prompt);
      const rawText = result?.response?.text?.();

      return typeof rawText === "string" ? rawText.trim() : "";
    } catch (error) {
      lastError = error;
      const status = error?.status || error?.code || null;
      const isNotFound = status === 404;

      console.error("Gemini model request failed", {
        model: modelName,
        message: error?.message || "Unknown Gemini error",
        status,
        providerPayload: error?.response || error?.errorDetails || error?.details || null,
        stack: error?.stack,
      });

      if (!isNotFound) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Failed to generate Gemini response");
};
