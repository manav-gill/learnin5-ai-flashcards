import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import FlashcardViewer from '../components/FlashcardViewer';
import {
  clearAuthSession,
  getMyFlashcards,
  isUnauthorizedError,
} from '../services/api';
import './SavedFlashcards.css';

const SAVED_TOPICS_SKELETON_COUNT = 4;

const formatSavedDate = (isoDate) => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeSavedDeck = (deck, index) => {
  const flashcards = Array.isArray(deck?.flashcards) ? deck.flashcards : [];
  const firstCard = flashcards[0];

  return {
    id: typeof deck?._id === 'string' ? deck._id : `saved-topic-${index}`,
    topic: typeof deck?.topic === 'string' && deck.topic.trim() ? deck.topic.trim() : 'Untitled topic',
    preview:
      typeof firstCard?.explanation === 'string' && firstCard.explanation.trim()
        ? firstCard.explanation.trim()
        : 'No preview available yet.',
    savedAt: typeof deck?.createdAt === 'string' ? deck.createdAt : '',
    flashcards: flashcards.map((card, cardIndex) => {
      const sourcePoints = Array.isArray(card?.keyPoints)
        ? card.keyPoints
        : Array.isArray(card?.points)
          ? card.points
          : [];

      const normalizedPoints = sourcePoints
        .filter((point) => typeof point === 'string' && point.trim())
        .map((point) => point.trim())
        .slice(0, 4);

      return {
        title:
          typeof card?.title === 'string' && card.title.trim()
            ? card.title.trim()
            : `Flashcard ${cardIndex + 1}`,
        explanation:
          typeof card?.explanation === 'string' && card.explanation.trim()
            ? card.explanation.trim()
            : 'Explanation is unavailable.',
        keyPoints: normalizedPoints,
        points: normalizedPoints,
        example:
          typeof card?.example === 'string' && card.example.trim()
            ? card.example.trim()
            : 'Example unavailable.',
        quiz:
          typeof card?.quiz === 'string' && card.quiz.trim()
            ? card.quiz.trim()
            : 'Quiz unavailable.',
      };
    }),
  };
};

export default function SavedFlashcards({
  title = 'Saved Flashcards',
  subtitle = 'Your saved topics are organized here for quick revision.',
}) {
  const navigate = useNavigate();
  const [savedTopics, setSavedTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerSessionKey, setViewerSessionKey] = useState(0);

  const selectedDeck = useMemo(
    () => savedTopics.find((deck) => deck.id === selectedDeckId) || null,
    [savedTopics, selectedDeckId]
  );

  useEffect(() => {
    const fetchSavedDecks = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await getMyFlashcards();
        const normalizedDecks = response.map((deck, index) => normalizeSavedDeck(deck, index));
        setSavedTopics(normalizedDecks);
        setSelectedDeckId('');
        setIsViewerOpen(false);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          clearAuthSession();
          navigate('/auth', {
            replace: true,
            state: {
              from: '/my-deck',
              message: 'Please log in to access your saved flashcards.',
            },
          });
          return;
        }

        setErrorMessage(error?.message || 'Unable to load saved flashcards right now.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedDecks();
  }, [navigate]);

  const handleViewDetails = (deckId) => {
    setSelectedDeckId(deckId);
    setViewerSessionKey((current) => current + 1);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };

  const handleRetryFetch = () => {
    setIsLoading(true);
    setErrorMessage('');

    getMyFlashcards()
      .then((response) => {
        const normalizedDecks = response.map((deck, index) => normalizeSavedDeck(deck, index));
        setSavedTopics(normalizedDecks);
        setSelectedDeckId('');
        setIsViewerOpen(false);
      })
      .catch((error) => {
        if (isUnauthorizedError(error)) {
          clearAuthSession();
          navigate('/auth', {
            replace: true,
            state: {
              from: '/my-deck',
              message: 'Please log in to access your saved flashcards.',
            },
          });
          return;
        }

        setErrorMessage(error?.message || 'Unable to load saved flashcards right now.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="saved-flashcards-page">
      <header className="saved-flashcards-page__header animate-fade-in">
        <h1 className="saved-flashcards-page__title">{title}</h1>
        <p className="saved-flashcards-page__subtitle">
          {subtitle}
        </p>
      </header>

      {isLoading ? (
        <section className="saved-topics-grid" aria-label="Loading saved flashcards">
          {Array.from({ length: SAVED_TOPICS_SKELETON_COUNT }, (_, index) => (
            <GlassCard key={`saved-topic-skeleton-${index}`} className="saved-topic-card saved-topic-card--skeleton">
              <div className="skeleton saved-topic-card__skeleton-name" />
              <div className="skeleton saved-topic-card__skeleton-date" />
              <div className="skeleton saved-topic-card__skeleton-line" />
              <div className="skeleton saved-topic-card__skeleton-line saved-topic-card__skeleton-line--short" />
              <div className="skeleton saved-topic-card__skeleton-btn" />
            </GlassCard>
          ))}
        </section>
      ) : errorMessage ? (
        <GlassCard className="saved-flashcards-page__empty saved-flashcards-page__empty--error" compact>
          <p className="saved-flashcards-page__empty-title">Could not load saved flashcards</p>
          <p className="saved-flashcards-page__empty-subtitle">
            {errorMessage}
          </p>
          <Button variant="secondary" size="sm" onClick={handleRetryFetch}>
            Retry
          </Button>
        </GlassCard>
      ) : savedTopics.length === 0 ? (
        <GlassCard className="saved-flashcards-page__empty" compact>
          <p className="saved-flashcards-page__empty-title">No saved flashcards yet</p>
          <p className="saved-flashcards-page__empty-subtitle">
            Save any generated set and it will appear here.
          </p>
        </GlassCard>
      ) : (
        <section className="saved-topics-grid stagger-children">
          {savedTopics.map((topic) => (
            <GlassCard key={topic.id} className="saved-topic-card" hoverable>
              <div className="saved-topic-card__top">
                <h3 className="saved-topic-card__name">{topic.topic}</h3>
                <span className="saved-topic-card__date">{formatSavedDate(topic.savedAt)}</span>
              </div>

              <p className="saved-topic-card__preview">{topic.preview}</p>

              <div className="saved-topic-card__actions">
                <Button
                  variant="secondary"
                  size="sm"
                  className={`saved-topic-card__view-btn ${selectedDeckId === topic.id && isViewerOpen ? 'saved-topic-card__view-btn--active' : ''}`}
                  onClick={() => handleViewDetails(topic.id)}
                >
                  View
                </Button>
              </div>
            </GlassCard>
          ))}
        </section>
      )}

      <FlashcardViewer
        key={`flashcard-viewer-${viewerSessionKey}-${selectedDeckId || 'none'}`}
        isOpen={isViewerOpen}
        deck={selectedDeck}
        onClose={handleCloseViewer}
      />
    </div>
  );
}
