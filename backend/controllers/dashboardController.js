import SavedFlashcard from "../models/SavedFlashcard.js";
import User from "../models/User.js";

const isFiniteNumber = (value) => Number.isFinite(Number(value));

const firstFiniteNumber = (...values) => {
  for (const value of values) {
    if (isFiniteNumber(value)) {
      const numeric = Number(value);
      if (numeric >= 0) {
        return numeric;
      }
    }
  }

  return 0;
};

const sumSessionMinutes = (sessions) => {
  if (!Array.isArray(sessions)) {
    return 0;
  }

  return sessions.reduce((sum, session) => {
    const minutes = firstFiniteNumber(
      session?.minutes,
      session?.durationMinutes,
      session?.timeStudiedMinutes,
      session?.studyMinutes
    );

    return sum + minutes;
  }, 0);
};

const extractMinutesFromCard = (card) => {
  if (!card || typeof card !== "object") {
    return 0;
  }

  return firstFiniteNumber(
    card.timeStudiedMinutes,
    card.studyDurationMinutes,
    card.minutesStudied,
    card.timeSpentMinutes,
    card.durationMinutes,
    card.studyMinutes
  ) + sumSessionMinutes(card.studySessions);
};

const extractMinutesFromDeck = (deck) => {
  if (!deck || typeof deck !== "object") {
    return 0;
  }

  const deckMinutes = firstFiniteNumber(
    deck.timeStudiedMinutes,
    deck.studyDurationMinutes,
    deck.minutesStudied,
    deck.timeSpentMinutes,
    deck.durationMinutes,
    deck.studyMinutes
  );

  return deckMinutes + sumSessionMinutes(deck.studySessions);
};

const isMasteredCard = (card) => {
  if (!card || typeof card !== "object") {
    return false;
  }

  const status = typeof card.status === "string" ? card.status.trim().toLowerCase() : "";

  return (
    card.mastered === true
    || card.isMastered === true
    || status === "mastered"
  );
};

const toDayKey = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateStudyStreak = (activityDayKeys) => {
  if (!(activityDayKeys instanceof Set) || activityDayKeys.size === 0) {
    return 0;
  }

  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  const todayKey = toDayKey(cursor);
  if (!activityDayKeys.has(todayKey)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;

  while (activityDayKeys.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
};

const formatRelativeTime = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [user, decks] = await Promise.all([
      User.findById(userId).select("name email").lean(),
      SavedFlashcard.find({ userId })
        .select("topic flashcards createdAt updatedAt timeStudiedMinutes studyDurationMinutes minutesStudied timeSpentMinutes durationMinutes studyMinutes studySessions")
        .lean(),
    ]);

    const safeDecks = Array.isArray(decks) ? decks : [];

    let totalFlashcards = 0;
    let mastered = 0;
    let timeStudied = 0;
    const activityDayKeys = new Set();

    for (const deck of safeDecks) {
      const flashcards = Array.isArray(deck?.flashcards) ? deck.flashcards : [];

      totalFlashcards += flashcards.length;
      mastered += flashcards.filter((card) => isMasteredCard(card)).length;
      timeStudied += extractMinutesFromDeck(deck);

      for (const card of flashcards) {
        timeStudied += extractMinutesFromCard(card);

        const cardActivityKeys = [
          card?.lastStudiedAt,
          card?.studiedAt,
          card?.updatedAt,
          card?.createdAt,
        ];

        for (const keyCandidate of cardActivityKeys) {
          const key = toDayKey(keyCandidate);
          if (key) {
            activityDayKeys.add(key);
          }
        }
      }

      const deckActivityKeys = [deck?.updatedAt, deck?.createdAt];
      for (const keyCandidate of deckActivityKeys) {
        const key = toDayKey(keyCandidate);
        if (key) {
          activityDayKeys.add(key);
        }
      }
    }

    const studyStreak = calculateStudyStreak(activityDayKeys);

    const colorPalette = ["purple", "green", "blue", "pink"];
    const recentActivity = [...safeDecks]
      .sort((a, b) => {
        const aDate = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
        const bDate = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 5)
      .map((deck, index) => ({
        title: deck?.topic
          ? `Reviewed \"${deck.topic}\"`
          : "Reviewed flashcards",
        time: formatRelativeTime(deck?.updatedAt || deck?.createdAt),
        color: colorPalette[index % colorPalette.length],
      }));

    return res.status(200).json({
      success: true,
      totalFlashcards,
      studyStreak,
      mastered,
      timeStudied: Math.round(timeStudied),
      userName: user?.name || "Learner",
      recentActivity,
    });
  } catch (error) {
    return next(error);
  }
};
