import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import {
  getAuthUser,
  isAuthenticated,
  loginUser,
  registerUser,
  setAuthSession,
} from '../services/api';
import './AuthPage.css';

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  password: '',
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login');
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = useMemo(() => {
    const from = location.state?.from;
    return typeof from === 'string' && from.startsWith('/') ? from : '/generate';
  }, [location.state]);

  const locationMessage = typeof location.state?.message === 'string' ? location.state.message : '';

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath]);

  const updateField = (field) => (event) => {
    setFormState((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formState.name.trim();
    const email = formState.email.trim().toLowerCase();
    const password = formState.password;

    if (!email || !password || (mode === 'register' && !name)) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (mode === 'register') {
        const registerResponse = await registerUser({ name, email, password });
        const loginResponse = await loginUser({ email, password });

        setAuthSession({
          token: loginResponse.token,
          user: registerResponse.user,
        });
      } else {
        const loginResponse = await loginUser({ email, password });
        const existingUser = getAuthUser();
        const loginUserProfile = loginResponse?.user && typeof loginResponse.user === 'object'
          ? loginResponse.user
          : null;

        setAuthSession({
          token: loginResponse.token,
          user: loginUserProfile || {
            name: existingUser?.name || 'Learner',
            email,
          },
        });
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(error?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <GlassCard className="auth-card" hoverable>
        <div className="auth-card__header">
          <p className="auth-card__badge">Learn in 5</p>
          <h1 className="auth-card__title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="auth-card__subtitle">
            {mode === 'login'
              ? 'Log in to generate and save your AI flashcards.'
              : 'Sign up to start generating and organizing your flashcards.'}
          </p>
        </div>

        <div className="auth-card__switch" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`auth-card__switch-btn ${mode === 'login' ? 'auth-card__switch-btn--active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-card__switch-btn ${mode === 'register' ? 'auth-card__switch-btn--active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        </div>

        {(locationMessage || errorMessage) && (
          <p
            className={`auth-card__message ${errorMessage ? 'auth-card__message--error' : 'auth-card__message--info'}`}
            role="status"
            aria-live="polite"
          >
            {errorMessage || locationMessage}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-form__field">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                value={formState.name}
                onChange={updateField('name')}
                placeholder="Madhav Gill"
                autoComplete="name"
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="auth-form__field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={formState.email}
              onChange={updateField('email')}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={formState.password}
              onChange={updateField('password')}
              placeholder="Enter password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
            {isSubmitting && <span className="loading-spinner" aria-hidden="true" />}
            {isSubmitting
              ? mode === 'login'
                ? 'Logging in...'
                : 'Creating account...'
              : mode === 'login'
                ? 'Login'
                : 'Create Account'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
