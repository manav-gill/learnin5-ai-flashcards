export const REQUIRED_COUNT = 5;

export const buildFallbackFlashcard = (index) => {
  const number = index + 1;
  const fallbackPoints = [
    "Try generating again for a richer explanation.",
    "Review the topic basics before moving ahead.",
  ];
  return {
    title: `Flashcard ${number}`,
    explanation: "This flashcard summary is temporarily unavailable.",
    keyPoints: fallbackPoints,
    example: "Example is unavailable right now.",
    quiz: "What key idea should you review first?",
  };
};

export const buildFallbackFlashcards = () => Array.from(
  { length: REQUIRED_COUNT },
  (_, index) => buildFallbackFlashcard(index)
);

export const parseFlashcards = (aiText, topic) => {
  console.log("Incoming Topic:", topic);
  console.log("Raw AI Response:", aiText);

  if (!aiText || typeof aiText !== "string" || !aiText.trim()) {
    throw new Error("Empty AI response");
  }

  const start = aiText.indexOf('[');
  const end = aiText.lastIndexOf(']');
  
  if (start === -1 || end === -1 || start > end) {
    throw new Error("Invalid AI JSON format (Could not find array brackets)");
  }

  const jsonString = aiText.slice(start, end + 1);
  console.log("Extracted JSON:", jsonString);

  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON Parse Error:", err);
    throw new Error("Invalid AI JSON format");
  }

  console.log("Parsed Output:", data);

  if (!Array.isArray(data)) {
    throw new Error("Invalid AI JSON format (Not an array)");
  }

  const normalized = data.slice(0, REQUIRED_COUNT).map((item, index) => {
    return {
      title: typeof item?.title === "string" ? item.title : `Dynamic Flashcard ${index + 1}`,
      explanation: typeof item?.explanation === "string" ? item.explanation : "Explanation will be added shortly.",
      keyPoints: Array.isArray(item?.keyPoints) && item.keyPoints.length > 0 
        ? item.keyPoints 
        : (Array.isArray(item?.points) && item.points.length > 0 ? item.points : ["Point 1 pending", "Point 2 pending"]),
      example: typeof item?.example === "string" ? item.example : "Example pending.",
      quiz: typeof item?.quiz === "string" ? item.quiz : "Quiz pending."
    };
  });

  while (normalized.length < REQUIRED_COUNT) {
     normalized.push(buildFallbackFlashcard(normalized.length));
  }

  return normalized;
};
