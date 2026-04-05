export const REQUIRED_COUNT = 5;

const toSafeString = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const cleanValue = value.trim();
  return cleanValue || fallback;
};

const limitWords = (text, maxWords) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ");
};

export const buildFallbackFlashcard = (index) => {
  const number = index + 1;

  const fallbackPoints = [
    "Try generating again for a richer explanation.",
    "Review the topic basics before moving ahead.",
  ];

  return {
    title: `Flashcard ${number}`,
    explanation: "This flashcard summary is temporarily unavailable.",
    points: fallbackPoints,
    keyPoints: fallbackPoints,
    example: "Example is unavailable right now.",
    quiz: "What key idea should you review first?",
  };
};

export const buildFallbackFlashcards = () => Array.from(
  { length: REQUIRED_COUNT },
  (_, index) => buildFallbackFlashcard(index)
);

const normalizePoints = (item) => {
  const sourcePoints = Array.isArray(item?.points)
    ? item.points
    : Array.isArray(item?.keyPoints)
      ? item.keyPoints
      : Array.isArray(item?.["key points"])
        ? item["key points"]
        : [];

  const normalized = sourcePoints
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  while (normalized.length < 2) {
    normalized.push("Point not available.");
  }

  return normalized;
};

const normalizeFlashcard = (item, index) => {
  const fallback = buildFallbackFlashcard(index);
  const normalizedPoints = normalizePoints(item);

  return {
    title: toSafeString(item?.title, fallback.title),
    explanation: limitWords(
      toSafeString(item?.explanation, fallback.explanation),
      40
    ),
    points: normalizedPoints,
    keyPoints: normalizedPoints,
    example: toSafeString(item?.example, fallback.example),
    quiz: toSafeString(item?.quiz, fallback.quiz),
  };
};

const isFlashcardLikeObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return (
    typeof value.explanation === "string"
    || Array.isArray(value.keyPoints)
    || Array.isArray(value.points)
    || typeof value.example === "string"
    || typeof value.quiz === "string"
  );
};

const toFlashcardArray = (parsed) => {
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  if (Array.isArray(parsed.flashcards)) {
    return parsed.flashcards;
  }

  if (isFlashcardLikeObject(parsed)) {
    return [parsed];
  }

  return null;
};


const extractJsonCandidates = (rawText) => {
  if (typeof rawText !== "string") {
    return [];
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return [];
  }

  const withoutFenceStart = trimmed.replace(/^```(?:json)?\s*/i, "");
  const withoutFences = withoutFenceStart.replace(/\s*```$/i, "").trim();

  const candidates = [];
  const firstBracket = withoutFences.indexOf("[");
  const lastBracket = withoutFences.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    candidates.push(withoutFences.slice(firstBracket, lastBracket + 1));
  }
  
  candidates.push(withoutFences);

  return candidates;
};

export const parseFlashcards = (rawText) => {
  console.log("=== AI RAW RESPONSE BEFORE PARSING ===");
  console.log(rawText);
  console.log("======================================");

  const candidates = extractJsonCandidates(rawText);
  let parsedArray = null;

  for (const candidate of candidates) {
    let parsed = null;
    try {
      parsed = JSON.parse(candidate);
    } catch (err) {
      console.warn(`JSON parsing failed for candidate. Reason: ${err.message}`);
      continue;
    }

    const flashcardArray = toFlashcardArray(parsed);

    if (Array.isArray(flashcardArray) && flashcardArray.length > 0) {
      parsedArray = flashcardArray;
      break;
    } else {
      console.warn("Parsed candidate is not a valid flashcard array.", parsed);
    }
  }

  if (!parsedArray) {
    console.error("Critical Error: Failed to parse any valid AI response. Falling back.");
    return buildFallbackFlashcards();
  }

  const normalized = parsedArray
    .slice(0, REQUIRED_COUNT)
    .map((item, index) => normalizeFlashcard(item, index));

  while (normalized.length < REQUIRED_COUNT) {
    console.warn(`Partial data received. Expected ${REQUIRED_COUNT}, got ${normalized.length}. Filling with fallback.`);
    normalized.push(buildFallbackFlashcard(normalized.length));
  }

  console.log("=== PARSED & NORMALIZED FLASHCARDS ===");
  console.log(JSON.stringify(normalized, null, 2));
  console.log("======================================");

  return normalized;
};
