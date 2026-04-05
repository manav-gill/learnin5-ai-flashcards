export const REQUIRED_COUNT = 5;

const REQUIRED_KEYPOINTS = 2;

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const toSafeString = (value, fallback) => {
  if (!isNonEmptyString(value)) {
    return fallback;
  }

  return value.trim();
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
    keyPoints: fallbackPoints,
    example: "Example is unavailable right now.",
    quiz: "What key idea should you review first?",
  };
};

export const buildFallbackFlashcards = () => Array.from(
  { length: REQUIRED_COUNT },
  (_, index) => buildFallbackFlashcard(index)
);

const normalizeKeyPoints = (item) => {
  const rawPoints = Array.isArray(item?.keyPoints)
    ? item.keyPoints
    : Array.isArray(item?.points)
      ? item.points
      : [];

  const normalized = rawPoints
    .filter((point) => isNonEmptyString(point))
    .map((point) => point.trim())
    .slice(0, REQUIRED_KEYPOINTS);

  while (normalized.length < REQUIRED_KEYPOINTS) {
    normalized.push("Point not available.");
  }

  return normalized;
};

const normalizeFlashcard = (item, index) => {
  const fallback = buildFallbackFlashcard(index);
  const keyPoints = normalizeKeyPoints(item);

  return {
    title: toSafeString(item?.title, fallback.title),
    explanation: toSafeString(item?.explanation, fallback.explanation),
    keyPoints,
    points: keyPoints,
    example: toSafeString(item?.example, fallback.example),
    quiz: toSafeString(item?.quiz, fallback.quiz),
  };
};

const tryParseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const extractCandidates = (rawText) => {
  if (!isNonEmptyString(rawText)) {
    return [];
  }

  const trimmed = rawText.trim();
  const withoutFenceStart = trimmed.replace(/^```(?:json)?\s*/i, "");
  const withoutFences = withoutFenceStart.replace(/\s*```$/i, "").trim();
  const candidates = [withoutFences];

  const firstArrayStart = withoutFences.indexOf("[");
  const lastArrayEnd = withoutFences.lastIndexOf("]");
  if (firstArrayStart !== -1 && lastArrayEnd !== -1 && lastArrayEnd > firstArrayStart) {
    candidates.push(withoutFences.slice(firstArrayStart, lastArrayEnd + 1));
  }

  const firstObjectStart = withoutFences.indexOf("{");
  const lastObjectEnd = withoutFences.lastIndexOf("}");
  if (firstObjectStart !== -1 && lastObjectEnd !== -1 && lastObjectEnd > firstObjectStart) {
    candidates.push(withoutFences.slice(firstObjectStart, lastObjectEnd + 1));
  }

  return [...new Set(candidates)];
};

const toArrayShape = (parsed) => {
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  if (Array.isArray(parsed.flashcards)) {
    return parsed.flashcards;
  }

  const looksLikeCard = (
    isNonEmptyString(parsed.explanation)
    || Array.isArray(parsed.keyPoints)
    || Array.isArray(parsed.points)
    || isNonEmptyString(parsed.example)
    || isNonEmptyString(parsed.quiz)
  );

  return looksLikeCard ? [parsed] : null;
};

export const parseFlashcards = (aiText, topic) => {
  console.log("Incoming Topic:", topic);
  console.log("Raw AI Response:", aiText);

  if (!aiText || typeof aiText !== "string" || !aiText.trim()) {
    throw new Error("Empty AI response");
  }

  const candidates = extractCandidates(aiText);
  let parsedArray = null;

  for (const candidate of candidates) {
    const parsed = tryParseJson(candidate);
    const arrayShape = toArrayShape(parsed);

    if (Array.isArray(arrayShape)) {
      parsedArray = arrayShape;
      break;
    }
  }

  if (!Array.isArray(parsedArray)) {
    throw new Error("Invalid AI JSON format");
  }

  const normalized = parsedArray
    .slice(0, REQUIRED_COUNT)
    .map((item, index) => normalizeFlashcard(item, index));

  while (normalized.length < REQUIRED_COUNT) {
    normalized.push(buildFallbackFlashcard(normalized.length));
  }

  console.log("Parsed Output:", normalized);

  return normalized;
};
