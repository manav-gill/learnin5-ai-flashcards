import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import {
  clearAuthSession,
  generateFlashcards,
  getAuthToken,
  getAuthUser,
  getDashboardData,
  isUnauthorizedError,
  saveFlashcards,
} from '../services/api';
import './Dashboard.css';

const FLASHCARD_SKELETON_COUNT = 5;
const ACTIVITY_COLORS = ['purple', 'green', 'blue', 'pink'];

const sanitizeNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : 0;
};

const formatTimeStudied = (minutesValue) => {
  const minutes = sanitizeNumber(minutesValue);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = minutes / 60;
  const normalizedHours = Number.isInteger(hours) ? hours : Number(hours.toFixed(1));

  return `${normalizedHours}h`;
};

const buildStats = (dashboardData) => {
  const totalFlashcards = sanitizeNumber(dashboardData?.totalFlashcards);
  const studyStreak = sanitizeNumber(dashboardData?.studyStreak);
  const mastered = sanitizeNumber(dashboardData?.mastered);
  const timeStudied = sanitizeNumber(dashboardData?.timeStudied);
  const masteryRate = totalFlashcards > 0 ? Math.round((mastered / totalFlashcards) * 100) : 0;

  return [
    {
      icon: '📚',
      label: 'Total Flashcards',
      value: String(totalFlashcards),
      change: 'saved overall',
      changeDirection: 'up',
      accentColor: 'purple',
    },
    {
      icon: '🔥',
      label: 'Study Streak',
      value: String(studyStreak),
      change: `${studyStreak === 1 ? 'day' : 'days'} in a row`,
      changeDirection: 'up',
      accentColor: 'green',
    },
    {
      icon: '✅',
      label: 'Mastered',
      value: String(mastered),
      change: `${masteryRate}% mastery`,
      changeDirection: 'up',
      accentColor: 'blue',
    },
    {
      icon: '⏱️',
      label: 'Time Studied',
      value: formatTimeStudied(timeStudied),
      change: 'total',
      changeDirection: 'up',
      accentColor: 'pink',
    },
  ];
};

const normalizeRecentActivity = (recentActivity) => {
  if (!Array.isArray(recentActivity)) {
    return [];
  }

  return recentActivity
    .map((item, index) => {
      const title = typeof item?.title === 'string' ? item.title.trim() : '';
      const time = typeof item?.time === 'string' ? item.time.trim() : '';
      const color = ACTIVITY_COLORS.includes(item?.color) ? item.color : ACTIVITY_COLORS[index % ACTIVITY_COLORS.length];

      if (!title) {
        return null;
      }

      return {
        title,
        time: time || 'Recently',
        color,
      };
    })
    .filter(Boolean)
    .slice(0, 5);
};

const buildFallbackFlashcard = (index) => ({
  title: `Flashcard ${index + 1}`,
  explanation: 'No explanation provided yet.',
  keyPoints: ['Review the main concept.', 'Revise one practical example.'],
  points: ['Review the main concept.', 'Revise one practical example.'],
  example: 'No example provided yet.',
  quiz: 'What is the key idea of this topic?',
});

const normalizeKeyPoints = (item, index) => {
  const source = Array.isArray(item?.keyPoints)
    ? item.keyPoints
    : Array.isArray(item?.points)
      ? item.points
      : buildFallbackFlashcard(index).keyPoints;

  const normalized = source
    .filter((point) => typeof point === 'string' && point.trim())
    .map((point) => point.trim())
    .slice(0, 3);

  while (normalized.length < 2) {
    normalized.push('Point not available.');
  }

  return normalized;
};

const normalizeFlashcards = (flashcards) => {
  const source = Array.isArray(flashcards) ? flashcards : [];

  const normalized = source
    .slice(0, FLASHCARD_SKELETON_COUNT)
    .map((item, index) => {
      const keyPoints = normalizeKeyPoints(item, index);

      return {
        title: typeof item?.title === 'string' && item.title.trim() ? item.title.trim() : buildFallbackFlashcard(index).title,
        explanation:
          typeof item?.explanation === 'string' && item.explanation.trim()
            ? item.explanation.trim()
            : buildFallbackFlashcard(index).explanation,
        keyPoints,
        points: keyPoints,
        example:
          typeof item?.example === 'string' && item.example.trim()
            ? item.example.trim()
            : buildFallbackFlashcard(index).example,
        quiz:
          typeof item?.quiz === 'string' && item.quiz.trim()
            ? item.quiz.trim()
            : buildFallbackFlashcard(index).quiz,
      };
    });

  while (normalized.length < FLASHCARD_SKELETON_COUNT) {
    normalized.push(buildFallbackFlashcard(normalized.length));
  }

  return normalized;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const topicInputRef = useRef(null);
  const isMountedRef = useRef(true);

  const [topicInput, setTopicInput] = useState('');
  const [generatedTopic, setGeneratedTopic] = useState('');
  const [generatedFlashcards, setGeneratedFlashcards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [saveState, setSaveState] = useState('idle');
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardData, setDashboardData] = useState(() => ({
    totalFlashcards: 0,
    studyStreak: 0,
    mastered: 0,
    timeStudied: 0,
    userName: getAuthUser()?.name || 'Learner',
    recentActivity: [],
  }));

  const hasGeneratedFlashcards = generatedFlashcards.length === FLASHCARD_SKELETON_COUNT;
  const dashboardStats = buildStats(dashboardData);
  const recentActivity = normalizeRecentActivity(dashboardData.recentActivity);

  const loadDashboardData = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    setIsDashboardLoading(true);
    setDashboardError('');

    if (!getAuthToken()) {
      setDashboardData((current) => ({
        ...current,
        totalFlashcards: 0,
        studyStreak: 0,
        mastered: 0,
        timeStudied: 0,
        userName: getAuthUser()?.name || 'Learner',
        recentActivity: [],
      }));
      setIsDashboardLoading(false);
      return;
    }

    try {
      const data = await getDashboardData();

      if (!isMountedRef.current) {
        return;
      }

      setDashboardData({
        totalFlashcards: sanitizeNumber(data?.totalFlashcards),
        studyStreak: sanitizeNumber(data?.studyStreak),
        mastered: sanitizeNumber(data?.mastered),
        timeStudied: sanitizeNumber(data?.timeStudied),
        userName: typeof data?.userName === 'string' && data.userName.trim()
          ? data.userName.trim()
          : getAuthUser()?.name || 'Learner',
        recentActivity: Array.isArray(data?.recentActivity) ? data.recentActivity : [],
      });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      if (isUnauthorizedError(error)) {
        clearAuthSession();
        navigate('/auth', {
          replace: true,
          state: {
            from: '/generate',
            message: 'Please log in to continue.',
          },
        });
        return;
      }

      setDashboardError(error?.message || 'Unable to load dashboard data right now.');
    } finally {
      if (isMountedRef.current) {
        setIsDashboardLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadDashboardData();

    window.addEventListener('auth-session-changed', loadDashboardData);
    window.addEventListener('storage', loadDashboardData);

    return () => {
      window.removeEventListener('auth-session-changed', loadDashboardData);
      window.removeEventListener('storage', loadDashboardData);
    };
  }, [loadDashboardData]);

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

    saveFlashcards({
      topic: generatedTopic || topicInput.trim() || 'Generated Topic',
      flashcards: generatedFlashcards,
    })
      .then(() => {
        setSaveState('success');
      })
      .catch((error) => {
        if (isUnauthorizedError(error)) {
          clearAuthSession();
          navigate('/auth', {
            replace: true,
            state: {
              from: '/generate',
              message: 'Your session expired. Please log in again.',
            },
          });
          return;
        }

        setSaveState('error');
      });
  };

  const handleGenerateFlashcards = async () => {
    const cleanTopic = topicInput.trim();

    if (cleanTopic.length < 3) {
      setGenerationError('Please enter a topic with at least 3 characters.');
      setGeneratedFlashcards([]);
      return;
    }

    setSaveState('idle');
    setGenerationError('');
    setIsGenerating(true);
    setGeneratedFlashcards([]);

    try {
      const apiFlashcards = await generateFlashcards(cleanTopic);
      const normalized = normalizeFlashcards(apiFlashcards);

      if (!normalized.length) {
        throw new Error('No flashcards were generated. Please try another topic.');
      }

      setGeneratedTopic(cleanTopic);
      setGeneratedFlashcards(normalized);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession();
        navigate('/auth', {
          replace: true,
          state: {
            from: '/generate',
            message: 'Please log in to continue generating flashcards.',
          },
        });
        return;
      }

      setGenerationError(error?.message || 'Unable to generate flashcards right now.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetryGeneration = () => {
    handleGenerateFlashcards();
  };

  const handleFocusGenerator = () => {
    topicInputRef.current?.focus();
  };

  const handleGeneratorSubmit = (event) => {
    event.preventDefault();
    handleGenerateFlashcards();
  };

  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dashboard__welcome animate-fade-in">
        <h1 className="dashboard__greeting">
          Welcome back, <span>{dashboardData.userName || 'Learner'}</span> 👋
        </h1>
        <p className="dashboard__subtitle">
          Generate, save, and revise exactly 5 flashcards for any topic in seconds.
        </p>

        {isDashboardLoading && (
          <p className="dashboard__data-state" role="status" aria-live="polite">
            Loading your dashboard data...
          </p>
        )}

        {!isDashboardLoading && dashboardError && (
          <p className="dashboard__data-state dashboard__data-state--error" role="status" aria-live="polite">
            {dashboardError}
          </p>
        )}
      </div>

      {/* Generator */}
      <section className="dashboard__generator">
        <GlassCard className="dashboard__generator-card">
          <div className="dashboard__generator-head">
            <h3 className="dashboard__section-title">Generate New Flashcards</h3>
            <p className="dashboard__generator-subtitle">
              Enter any topic to generate 5 AI flashcards with key points, example, and quiz.
            </p>
          </div>

          <form className="dashboard__generator-form" onSubmit={handleGeneratorSubmit}>
            <label className="dashboard__generator-label" htmlFor="topic-input">
              Topic
            </label>

            <div className="dashboard__generator-row">
              <input
                id="topic-input"
                ref={topicInputRef}
                type="text"
                value={topicInput}
                onChange={(event) => setTopicInput(event.target.value)}
                placeholder="Try: JavaScript closures, Photosynthesis, HTTP status codes..."
                className="dashboard__topic-input"
                disabled={isGenerating}
              />

              <Button type="submit" variant="primary" disabled={isGenerating}>
                {isGenerating && <span className="loading-spinner" aria-hidden="true" />}
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </form>

          {generationError && !hasGeneratedFlashcards && (
            <p className="dashboard__generator-error" role="status" aria-live="polite">
              {generationError}
            </p>
          )}

          {!generationError && hasGeneratedFlashcards && (
            <p className="dashboard__generator-success" role="status" aria-live="polite">
              Generated 5 flashcards for "{generatedTopic}".
            </p>
          )}
        </GlassCard>
      </section>

      {/* Stats */}
      <div className="dashboard__stats stagger-children">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard__content">
        {/* Recent Activity */}
        <div>
          <h3 className="dashboard__section-title">Recent Activity</h3>
          <GlassCard>
            {isDashboardLoading ? (
              <p className="activity-list__empty" role="status" aria-live="polite">
                Loading activity...
              </p>
            ) : recentActivity.length ? (
              <div className="activity-list">
                {recentActivity.map((activity, i) => (
                  <div className="activity-item" key={`${activity.title}-${i}`}>
                    <div className={`activity-item__dot activity-item__dot--${activity.color}`} />
                    <div className="activity-item__text">
                      <div className="activity-item__title">{activity.title}</div>
                      <div className="activity-item__time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="activity-list__empty">
                No recent activity yet. Generate and save your first flashcards.
              </p>
            )}
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="dashboard__section-title">Quick Actions</h3>
          <GlassCard>
            <div className="quick-actions">
              <Button variant="primary" fullWidth onClick={handleFocusGenerator}>
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
            <span className="generated-flashcards__meta">
              {hasGeneratedFlashcards ? `Exactly ${generatedFlashcards.length} cards` : 'No cards yet'}
            </span>

            {hasGeneratedFlashcards && (
              <Button
                variant="secondary"
                size="sm"
                className={`generated-flashcards__save-btn ${saveState === 'success' ? 'generated-flashcards__save-btn--saved' : ''}`}
                onClick={handleSaveFlashcards}
                disabled={saveState === 'saving' || isGenerating}
              >
                {saveState === 'saving' && <span className="loading-spinner" aria-hidden="true" />}
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
        ) : generationError && !hasGeneratedFlashcards ? (
          <GlassCard className="generated-flashcards__state generated-flashcards__state--error" compact>
            <h4 className="generated-flashcards__state-title">Unable to load generated flashcards</h4>
            <p className="generated-flashcards__state-text">{generationError}</p>
            <Button variant="secondary" size="sm" onClick={handleRetryGeneration}>
              Retry
            </Button>
          </GlassCard>
        ) : !hasGeneratedFlashcards ? (
          <GlassCard className="generated-flashcards__state" compact>
            <h4 className="generated-flashcards__state-title generated-flashcards__state-title--neutral">
              No flashcards generated yet
            </h4>
            <p className="generated-flashcards__state-text">
              Enter a topic above and click Generate to create your flashcards.
            </p>
          </GlassCard>
        ) : (
          <div className="generated-flashcards__grid">
            {generatedFlashcards.map((card, index) => (
              <GlassCard
                key={`${card.title}-${index}`}
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
                    {(Array.isArray(card.keyPoints) ? card.keyPoints : card.points).map((point, pointIndex) => (
                      <li key={`${card.title}-${point}-${pointIndex}`}>{point}</li>
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
