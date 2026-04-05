import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import './Dashboard.css';

const STATS = [
  {
    icon: '📚',
    label: 'Total Flashcards',
    value: '248',
    change: '+12 this week',
    changeDirection: 'up',
    accentColor: 'purple',
  },
  {
    icon: '🔥',
    label: 'Study Streak',
    value: '14',
    change: 'days in a row',
    changeDirection: 'up',
    accentColor: 'green',
  },
  {
    icon: '✅',
    label: 'Mastered',
    value: '89',
    change: '+5 today',
    changeDirection: 'up',
    accentColor: 'blue',
  },
  {
    icon: '⏱️',
    label: 'Time Studied',
    value: '4.2h',
    change: 'this week',
    changeDirection: 'up',
    accentColor: 'pink',
  },
];

const ACTIVITIES = [
  {
    title: 'Completed "JavaScript Closures" deck',
    time: '2 hours ago',
    color: 'purple',
  },
  {
    title: 'Created 8 new flashcards in "React Hooks"',
    time: '5 hours ago',
    color: 'green',
  },
  {
    title: 'Mastered "CSS Grid Basics" deck',
    time: 'Yesterday',
    color: 'blue',
  },
  {
    title: 'Started studying "Node.js Fundamentals"',
    time: 'Yesterday',
    color: 'pink',
  },
  {
    title: 'Achieved 7-day study streak 🎉',
    time: '2 days ago',
    color: 'green',
  },
];

const GENERATED_FLASHCARDS = [
  {
    title: 'JavaScript Closures',
    explanation:
      'A closure allows an inner function to access variables from its outer scope even after the outer function has finished executing.',
    points: [
      'Closures preserve lexical scope.',
      'They are useful for private state.',
      'Each function instance can keep its own memory.',
    ],
    example: 'A counter function that remembers count between calls.',
    quiz: 'Why does a closure still know outer variables after the parent function returns?',
  },
  {
    title: 'React useEffect Basics',
    explanation:
      'useEffect lets you run side effects like API calls or subscriptions after a component renders.',
    points: [
      'Runs after render by default.',
      'Dependency array controls when it re-runs.',
      'Return a cleanup function for timers and listeners.',
    ],
    example: 'Fetching user data when the component mounts with an empty dependency array.',
    quiz: 'What problem can happen if you forget to clean up an event listener in useEffect?',
  },
  {
    title: 'CSS Grid Layout',
    explanation:
      'CSS Grid is a two-dimensional layout system that helps place content into rows and columns with precise control.',
    points: [
      'Define tracks using grid-template-columns and rows.',
      'Use gap for clean spacing between items.',
      'Items can span multiple rows or columns.',
    ],
    example: 'A dashboard layout using grid-template-columns: 2fr 1fr for content and sidebar.',
    quiz: 'When would you prefer Grid over Flexbox for page layout?',
  },
  {
    title: 'HTTP Status Families',
    explanation:
      'HTTP status codes communicate how a request was handled, grouped into families like success, client error, and server error.',
    points: [
      '2xx indicates successful responses.',
      '4xx indicates request-side issues.',
      '5xx indicates server-side failures.',
    ],
    example: 'A login route returning 401 when credentials are invalid.',
    quiz: 'What is the difference between 401 Unauthorized and 403 Forbidden?',
  },
  {
    title: 'MongoDB Index Purpose',
    explanation:
      'Indexes improve query speed by organizing field values, reducing how many documents MongoDB needs to scan.',
    points: [
      'Indexes accelerate frequently filtered fields.',
      'Each extra index increases write overhead.',
      'Compound index order matters for query patterns.',
    ],
    example: 'Creating an index on email to speed up user lookup during login.',
    quiz: 'Why can too many indexes hurt insert and update performance?',
  },
];

const SAVED_FLASHCARDS_STORAGE_KEY = 'learnin5_saved_flashcards';
const FLASHCARD_SKELETON_COUNT = 5;
const FLASHCARD_GENERATION_DELAY_MS = 850;

const readStoredSavedTopics = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(SAVED_FLASHCARDS_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const persistSavedTopic = (flashcards) => {
  if (!Array.isArray(flashcards) || flashcards.length === 0 || typeof window === 'undefined') {
    return { ok: false };
  }

  const firstCard = flashcards[0];
  const topicName = typeof firstCard?.title === 'string' && firstCard.title.trim()
    ? firstCard.title.trim()
    : 'Generated topic';
  const previewText = typeof firstCard?.explanation === 'string' && firstCard.explanation.trim()
    ? firstCard.explanation.trim()
    : 'Review this saved flashcard set any time.';

  const savedTopic = {
    id: `saved-${Date.now()}`,
    topic: topicName,
    preview: previewText,
    savedAt: new Date().toISOString(),
  };

  const existingTopics = readStoredSavedTopics().filter((item) => item && typeof item === 'object');
  const nextTopics = [savedTopic, ...existingTopics].slice(0, 24);

  try {
    window.localStorage.setItem(SAVED_FLASHCARDS_STORAGE_KEY, JSON.stringify(nextTopics));
    return { ok: true };
  } catch {
    return { ok: false };
  }
};

export default function Dashboard() {
  const hasGeneratedFlashcards = GENERATED_FLASHCARDS.length === 5;
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationError, setGenerationError] = useState('');
  const [saveState, setSaveState] = useState('idle');

  useEffect(() => {
    const generationTimer = window.setTimeout(() => {
      if (hasGeneratedFlashcards) {
        setGenerationError('');
      } else {
        setGenerationError('We could not load your generated flashcards. Please try again.');
      }

      setIsGenerating(false);
    }, FLASHCARD_GENERATION_DELAY_MS);

    return () => {
      window.clearTimeout(generationTimer);
    };
  }, [hasGeneratedFlashcards]);

  useEffect(() => {
    if (saveState !== 'success' && saveState !== 'error') {
      return undefined;
    }

    const feedbackTimer = window.setTimeout(() => {
      setSaveState('idle');
    }, 2600);

    return () => {
      window.clearTimeout(feedbackTimer);
    };
  }, [saveState]);

  const handleSaveFlashcards = () => {
    if (!hasGeneratedFlashcards || isGenerating || saveState === 'saving') {
      return;
    }

    setSaveState('saving');

    window.setTimeout(() => {
      const saveResult = persistSavedTopic(GENERATED_FLASHCARDS);
      setSaveState(saveResult.ok ? 'success' : 'error');
    }, 550);
  };

  const handleRetryGeneration = () => {
    setGenerationError('');
    setIsGenerating(true);

    window.setTimeout(() => {
      if (hasGeneratedFlashcards) {
        setGenerationError('');
      } else {
        setGenerationError('We could not load your generated flashcards. Please try again.');
      }

      setIsGenerating(false);
    }, FLASHCARD_GENERATION_DELAY_MS);
  };

  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dashboard__welcome animate-fade-in">
        <h1 className="dashboard__greeting">
          Welcome back, <span>Madhav</span> 👋
        </h1>
        <p className="dashboard__subtitle">
          You've mastered 36% of your flashcards. Keep up the great work!
        </p>
      </div>

      {/* Stats */}
      <div className="dashboard__stats stagger-children">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard__content">
        {/* Recent Activity */}
        <div>
          <h3 className="dashboard__section-title">Recent Activity</h3>
          <GlassCard>
            <div className="activity-list">
              {ACTIVITIES.map((activity, i) => (
                <div className="activity-item" key={i}>
                  <div className={`activity-item__dot activity-item__dot--${activity.color}`} />
                  <div className="activity-item__text">
                    <div className="activity-item__title">{activity.title}</div>
                    <div className="activity-item__time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="dashboard__section-title">Quick Actions</h3>
          <GlassCard>
            <div className="quick-actions">
              <Button variant="primary" fullWidth>
                ✨ Generate Flashcards
              </Button>
              <Button variant="green" fullWidth>
                📖 Study Now
              </Button>
              <Button variant="secondary" fullWidth>
                📊 View Progress
              </Button>
              <Button variant="ghost" fullWidth>
                ⚙️ Settings
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Generated Flashcards */}
      <section className="generated-flashcards">
        <div className="generated-flashcards__header">
          <h3 className="dashboard__section-title">Generated Flashcards</h3>

          <div className="generated-flashcards__actions">
            <span className="generated-flashcards__meta">Exactly {GENERATED_FLASHCARDS.length} cards</span>

            {hasGeneratedFlashcards && (
              <Button
                variant="secondary"
                size="sm"
                className={`generated-flashcards__save-btn ${saveState === 'success' ? 'generated-flashcards__save-btn--saved' : ''}`}
                onClick={handleSaveFlashcards}
                disabled={saveState === 'saving' || isGenerating || Boolean(generationError)}
              >
                {saveState === 'saving' ? 'Saving...' : saveState === 'success' ? 'Saved' : saveState === 'error' ? 'Try Again' : 'Save Flashcards'}
              </Button>
            )}
          </div>
        </div>

        {saveState === 'success' && (
          <p className="generated-flashcards__save-feedback generated-flashcards__save-feedback--success" role="status" aria-live="polite">
            Flashcards saved successfully.
          </p>
        )}

        {saveState === 'error' && (
          <p className="generated-flashcards__save-feedback generated-flashcards__save-feedback--error" role="status" aria-live="polite">
            Could not save flashcards right now. Please try again.
          </p>
        )}

        {isGenerating ? (
          <div className="generated-flashcards__grid" aria-label="Loading generated flashcards">
            {Array.from({ length: FLASHCARD_SKELETON_COUNT }, (_, index) => (
              <GlassCard
                key={`flashcard-skeleton-${index}`}
                className="generated-flashcard generated-flashcard--skeleton"
                style={{ '--flashcard-delay': `${index * 70}ms` }}
              >
                <div className="skeleton generated-flashcard__skeleton-title" />
                <div className="skeleton generated-flashcard__skeleton-line" />
                <div className="skeleton generated-flashcard__skeleton-line generated-flashcard__skeleton-line--short" />
                <div className="skeleton generated-flashcard__skeleton-line" />
                <div className="skeleton generated-flashcard__skeleton-line" />
                <div className="skeleton generated-flashcard__skeleton-line generated-flashcard__skeleton-line--mid" />
                <div className="skeleton generated-flashcard__skeleton-quiz" />
              </GlassCard>
            ))}
          </div>
        ) : generationError ? (
          <GlassCard className="generated-flashcards__state generated-flashcards__state--error" compact>
            <h4 className="generated-flashcards__state-title">Unable to load generated flashcards</h4>
            <p className="generated-flashcards__state-text">{generationError}</p>
            <Button variant="secondary" size="sm" onClick={handleRetryGeneration}>
              Retry
            </Button>
          </GlassCard>
        ) : (
          <div className="generated-flashcards__grid">
            {GENERATED_FLASHCARDS.map((card, index) => (
              <GlassCard
                key={card.title}
                className="generated-flashcard"
                hoverable
                style={{ '--flashcard-delay': `${index * 90}ms` }}
              >
                <h4 className="generated-flashcard__title">{card.title}</h4>

                <div className="generated-flashcard__section">
                  <p className="generated-flashcard__label">Explanation</p>
                  <p className="generated-flashcard__text">{card.explanation}</p>
                </div>

                <div className="generated-flashcard__section">
                  <p className="generated-flashcard__label">Key points</p>
                  <ul className="generated-flashcard__list">
                    {card.points.map((point) => (
                      <li key={`${card.title}-${point}`}>{point}</li>
                    ))}
                  </ul>
                </div>

                <div className="generated-flashcard__section">
                  <p className="generated-flashcard__label">Example</p>
                  <p className="generated-flashcard__example">{card.example}</p>
                </div>

                <div className="generated-flashcard__quiz">
                  <p className="generated-flashcard__label generated-flashcard__label--quiz">Quiz</p>
                  <p className="generated-flashcard__quiz-text">{card.quiz}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
