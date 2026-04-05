import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiRoutes = Router();

const GEMINI_MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-pro",
];

const getGeminiModel = (modelName) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables");
  }

  const client = new GoogleGenerativeAI(apiKey);

  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
    },
  });
};

const generateWithBestAvailableModel = async (prompt) => {
  let lastError = null;

  for (const modelName of GEMINI_MODEL_CANDIDATES) {
    const model = getGeminiModel(modelName);

    try {
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.();

      if (typeof text === "string" && text.trim()) {
        return text.trim();
      }

      throw new Error("Empty response from Gemini");
    } catch (error) {
      lastError = error;
      const status = error?.status || error?.code || null;

      console.error("Gemini model request failed", {
        model: modelName,
        message: error?.message || "Unknown Gemini error",
        status,
        details: error?.response || error?.errorDetails || error?.details || null,
        stack: error?.stack,
      });

      if (status !== 404) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Failed to generate response");
};

geminiRoutes.post("/generate", async (req, res) => {
  try {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const text = await generateWithBestAvailableModel(prompt);

    return res.status(200).json({
      success: true,
      text: text.trim(),
    });
  } catch (error) {
    console.error("Gemini generate route error", {
      message: error?.message || "Unknown Gemini error",
      status: error?.status || error?.code || null,
      details: error?.response || error?.errorDetails || error?.details || null,
      stack: error?.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to generate response",
    });
  }
});

export default geminiRoutes;
