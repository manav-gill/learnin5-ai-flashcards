import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiRoutes = Router();

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables");
  }

  const client = new GoogleGenerativeAI(apiKey);

  return client.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
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

    const model = getGeminiModel();
    const strictPrompt = `${prompt}\n\nReturn ONLY valid JSON. Do not include any text outside JSON.`;
    const result = await model.generateContent(strictPrompt);
    const text = result?.response?.text?.();

    if (typeof text !== "string" || !text.trim()) {
      return res.status(502).json({
        success: false,
        message: "Empty response from Gemini",
      });
    }

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
