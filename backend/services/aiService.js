import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const isValidFlashcard = (item) => {
  return (
    item &&
    typeof item.title === "string" &&
    typeof item.explanation === "string" &&
    Array.isArray(item.points) &&
    item.points.length === 2 &&
    item.points.every((point) => typeof point === "string") &&
    typeof item.example === "string" &&
    typeof item.quiz === "string"
  );
};

export const getFlashcardsFromAI = async (topic) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY in environment variables");
    }

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
          content: `Generate exactly 5 flashcards about: ${topic}. Each flashcard must have: title, explanation (max 40 words), points (array of exactly 2 items), example, quiz. Return ONLY a valid JSON array and nothing else.`,
        },
      ],
    });

    const rawContent = completion.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("OpenAI response did not include content");
    }

    const parsed = JSON.parse(rawContent);

    if (!Array.isArray(parsed)) {
      throw new Error("OpenAI response is not a JSON array");
    }

    if (parsed.length !== 5) {
      throw new Error("OpenAI response must contain exactly 5 flashcards");
    }

    if (!parsed.every(isValidFlashcard)) {
      throw new Error("OpenAI response has an invalid flashcard format");
    }

    return parsed;
  } catch (error) {
    console.error("Error in getFlashcardsFromAI:", error);
    throw error;
  }
};
