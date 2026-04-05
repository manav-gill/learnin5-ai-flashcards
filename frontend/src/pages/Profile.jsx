import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import {
  clearAuthSession,
  getAuthUser,
  getMyFlashcards,
  isUnauthorizedError,
} from '../services/api';
import './Profile.css';

const DEFAULT_PROFILE_STATS = [
  { label: 'Flashcards Saved', value: '0' },
  { label: 'Study Streak', value: '14 days' },
  { label: 'Completion Rate', value: '91%' },
];

const PREFERENCES = [
  { label: 'Daily Goal', value: '20 cards/day' },
  { label: 'Reminder', value: '08:30 PM' },
  { label: 'Theme', value: 'Glass Light' },
  { label: 'Plan', value: 'Pro Active' },
];

const LEARNING_TOPICS = ['JavaScript', 'React', 'System Design', 'Databases'];

export default function Profile() {
  const navigate = useNavigate();
  const authUser = useMemo(() => getAuthUser(), []);
  const [profileStats, setProfileStats] = useState(DEFAULT_PROFILE_STATS);

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const savedDecks = await getMyFlashcards();
        const totalSavedDecks = savedDecks.length;

        setProfileStats((currentStats) => currentStats.map((stat) => (
          stat.label === 'Flashcards Saved'
            ? { ...stat, value: String(totalSavedDecks) }
            : stat
        )));
      } catch (error) {
        if (isUnauthorizedError(error)) {
          clearAuthSession();
          navigate('/auth', {
            replace: true,
            state: {
              from: '/profile',
              message: 'Please log in to continue.',
            },
          });
        }
      }
    };

    fetchProfileStats();
  }, [navigate]);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="profile-page">
      <header className="profile-page__header animate-fade-in">
        <h1 className="profile-page__title">Profile</h1>
        <p className="profile-page__subtitle">
          Manage your account details, learning focus, and study preferences.
        </p>
      </header>

      <section className="profile-page__grid">
        <GlassCard className="profile-card profile-card--identity">
          <div className="profile-card__identity">
            <div className="profile-card__avatar">{authUser?.name?.trim()?.charAt(0)?.toUpperCase() || 'L'}</div>
            <div className="profile-card__identity-text">
              <h3 className="profile-card__name">{authUser?.name || 'Learner'}</h3>
              <p className="profile-card__email">{authUser?.email || 'Logged in user'}</p>
            </div>
          </div>

          <p className="profile-card__description">
            Focused on learning technical topics quickly with concise flashcards and daily revision sessions.
          </p>

          <div className="profile-card__actions">
            <Button variant="secondary" size="sm">Edit Profile</Button>
            <Button variant="ghost" size="sm">Account Settings</Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </GlassCard>

        <GlassCard className="profile-card profile-card--focus" hoverable>
          <h3 className="profile-card__section-title">Learning Focus</h3>
          <div className="profile-focus-list">
            {LEARNING_TOPICS.map((topic) => (
              <span key={topic} className="profile-focus-list__item">
                {topic}
              </span>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="profile-stats-grid stagger-children">
        {profileStats.map((stat) => (
          <GlassCard key={stat.label} className="profile-stat-card" hoverable compact>
            <p className="profile-stat-card__label">{stat.label}</p>
            <p className="profile-stat-card__value">{stat.value}</p>
          </GlassCard>
        ))}
      </section>

      <GlassCard className="profile-card profile-card--preferences" hoverable>
        <h3 className="profile-card__section-title">Preferences</h3>
        <div className="profile-preferences">
          {PREFERENCES.map((item) => (
            <div key={item.label} className="profile-preferences__row">
              <span className="profile-preferences__label">{item.label}</span>
              <span className="profile-preferences__value">{item.value}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
