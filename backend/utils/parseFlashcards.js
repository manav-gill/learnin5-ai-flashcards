const REQUIRED_COUNT = 5;

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

const buildFallbackFlashcard = (index) => {
  const number = index + 1;

  return {
    title: `Flashcard ${number}`,
    explanation: "This flashcard summary is temporarily unavailable.",
    points: [
      "Try generating again for a richer explanation.",
      "Review the topic basics before moving ahead.",
    ],
    example: "Example is unavailable right now.",
    quiz: "What key idea should you review first?",
  };
};

const normalizePoints = (points) => {
  const sourcePoints = Array.isArray(points) ? points : [];
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

  return {
    title: toSafeString(item?.title, fallback.title),
    explanation: limitWords(
      toSafeString(item?.explanation, fallback.explanation),
      40
    ),
    points: normalizePoints(item?.points),
    example: toSafeString(item?.example, fallback.example),
    quiz: toSafeString(item?.quiz, fallback.quiz),
  };
};

const tryParseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
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

  const candidates = [withoutFences];
  const firstBracket = withoutFences.indexOf("[");
  const lastBracket = withoutFences.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    candidates.push(withoutFences.slice(firstBracket, lastBracket + 1));
  }

  return candidates;
};

export const parseFlashcards = (rawText) => {
  const candidates = extractJsonCandidates(rawText);
  let parsedArray = null;

  for (const candidate of candidates) {
    const parsed = tryParseJson(candidate);

    if (Array.isArray(parsed)) {
      parsedArray = parsed;
      break;
    }
  }

  if (!parsedArray) {
    return Array.from({ length: REQUIRED_COUNT }, (_, index) =>
      buildFallbackFlashcard(index)
    );
  }

  const normalized = parsedArray
    .slice(0, REQUIRED_COUNT)
    .map((item, index) => normalizeFlashcard(item, index));

  while (normalized.length < REQUIRED_COUNT) {
    normalized.push(buildFallbackFlashcard(normalized.length));
  }

  return normalized;
};
