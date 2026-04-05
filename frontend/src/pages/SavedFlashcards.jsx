import { useState } from 'react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import './SavedFlashcards.css';

const SAVED_FLASHCARDS_STORAGE_KEY = 'learnin5_saved_flashcards';

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

const loadSavedTopics = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(SAVED_FLASHCARDS_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter((item) => item && typeof item === 'object')
      .map((item, index) => ({
        id: typeof item.id === 'string' ? item.id : `saved-topic-${index}`,
        topic: typeof item.topic === 'string' && item.topic.trim() ? item.topic.trim() : 'Untitled topic',
        preview: typeof item.preview === 'string' && item.preview.trim()
          ? item.preview.trim()
          : 'No preview available yet.',
        savedAt: typeof item.savedAt === 'string' ? item.savedAt : '',
      }));
  } catch {
    return [];
  }
};

export default function SavedFlashcards() {
  const [savedTopics] = useState(() => loadSavedTopics());

  return (
    <div className="saved-flashcards-page">
      <header className="saved-flashcards-page__header animate-fade-in">
        <h1 className="saved-flashcards-page__title">Saved Flashcards</h1>
        <p className="saved-flashcards-page__subtitle">
          Your saved topics are organized here for quick revision.
        </p>
      </header>

      {savedTopics.length === 0 ? (
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
                <Button variant="secondary" size="sm" className="saved-topic-card__view-btn">
                  View
                </Button>
              </div>
            </GlassCard>
          ))}
        </section>
      )}
    </div>
  );
}
