import { useCallback, useEffect, useMemo, useState } from 'react';

const getSafeText = (value, fallback) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
};

const normalizePoints = (card) => {
  const source = Array.isArray(card?.keyPoints)
    ? card.keyPoints
    : Array.isArray(card?.points)
      ? card.points
      : [];

  const points = source
    .filter((point) => typeof point === 'string' && point.trim())
    .map((point) => point.trim())
    .slice(0, 4);

  return points.length ? points : ['No key points available yet.'];
};

const normalizeFlashcard = (card, index) => ({
  title: getSafeText(card?.title, `Flashcard ${index + 1}`),
  explanation: getSafeText(card?.explanation, 'No explanation available.'),
  keyPoints: normalizePoints(card),
  example: getSafeText(card?.example, 'No example available.'),
  quiz: getSafeText(card?.quiz, 'No quiz available.'),
});

export default function FlashcardViewer({ isOpen, onClose, deck }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const flashcards = useMemo(() => {
    const source = Array.isArray(deck?.flashcards) ? deck.flashcards : [];
    return source.map((card, index) => normalizeFlashcard(card, index));
  }, [deck]);

  const totalCards = flashcards.length;
  const safeIndex = totalCards > 0 ? Math.min(currentIndex, totalCards - 1) : 0;
  const currentCard = totalCards > 0 ? flashcards[safeIndex] : null;
  const canGoPrevious = safeIndex > 0;
  const canGoNext = safeIndex < totalCards - 1;

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handlePrevious = useCallback(() => {
    if (!canGoPrevious) {
      return;
    }

    setCurrentIndex((index) => Math.max(0, index - 1));
  }, [canGoPrevious]);

  const handleNext = useCallback(() => {
    if (!canGoNext) {
      return;
    }

    setCurrentIndex((index) => Math.min(totalCards - 1, index + 1));
  }, [canGoNext, totalCards]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose, handlePrevious, handleNext]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[220] bg-black/40 backdrop-blur-md" onClick={handleClose}>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div
          className="w-full max-w-xl rounded-2xl bg-white/95 shadow-2xl backdrop-blur-lg p-6 sm:p-7"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-600">{getSafeText(deck?.topic, 'Saved Flashcards')}</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">{currentCard?.title || 'Flashcard Viewer'}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">{totalCards > 0 ? `${safeIndex + 1}/${totalCards}` : '0/0'}</span>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18" strokeLinecap="round" />
                  <path d="M6 6L18 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {currentCard ? (
            <div className="mt-6 space-y-5">
              <section>
                <p className="text-sm uppercase tracking-wide text-gray-400">Explanation</p>
                <p className="mt-2 text-base text-gray-700 leading-relaxed">{currentCard.explanation}</p>
              </section>

              <section>
                <p className="text-sm uppercase tracking-wide text-gray-400">Key Points</p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-base text-gray-700">
                  {currentCard.keyPoints.map((point, index) => (
                    <li key={`${currentCard.title}-${index}-${point}`}>{point}</li>
                  ))}
                </ul>
              </section>

              <section>
                <p className="text-sm uppercase tracking-wide text-gray-400">Example</p>
                <p className="mt-2 text-base text-gray-700 leading-relaxed">{currentCard.example}</p>
              </section>

              <section>
                <p className="text-sm uppercase tracking-wide text-gray-400">Quiz</p>
                <p className="mt-2 text-base text-gray-700 leading-relaxed">{currentCard.quiz}</p>
              </section>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-5 text-center text-base text-gray-600">
              No flashcards found for this deck.
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className="px-4 py-2 rounded-lg bg-purple-500 text-white font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              className="px-4 py-2 rounded-lg bg-purple-500 text-white font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
