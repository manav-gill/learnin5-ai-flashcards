import api from '../api/client';

const AUTH_TOKEN_KEY = 'learnin5_token';
const LEGACY_AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'learnin5_user';

const emitAuthSessionChanged = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event('auth-session-changed'));
};

const safeJsonParse = (value) => {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const createApiError = (message, status = 0, data = null) => {
  const error = new Error(message || 'Request failed');
  error.status = status;
  error.data = data;
  return error;
};

const normalizeAxiosError = (error) => {
  const status = Number(error?.response?.status || 0);
  const data = error?.response?.data || null;
  const message = data?.message || error?.message || `Request failed (${status || 0})`;

  return createApiError(message, status, data);
};

const apiRequest = async (path, { method = 'GET', body, requiresAuth = false, headers = {} } = {}) => {
  const token = getAuthToken();

  if (requiresAuth && !token) {
    throw createApiError('Please log in to continue.', 401, null);
  }

  try {
    const response = await api.request({
      url: path.startsWith('/') ? path : `/${path}`,
      method,
      data: body,
      headers,
    });

    const data = response?.data;

    if (!data || typeof data !== 'object') {
      throw createApiError('Invalid server response', Number(response?.status || 0), null);
    }

    if (data.success === false) {
      throw createApiError(data.message || 'Request failed', Number(response?.status || 0), data);
    }

    return data;
  } catch (error) {
    if (error?.response) {
      throw normalizeAxiosError(error);
    }

    throw createApiError('Unable to connect to the server. Please try again.', 0, null);
  }
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY)
    || window.localStorage.getItem(LEGACY_AUTH_TOKEN_KEY)
    || '';
};

export const getAuthUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const parsedUser = safeJsonParse(window.localStorage.getItem(AUTH_USER_KEY));

  if (!parsedUser || typeof parsedUser !== 'object') {
    return null;
  }

  return parsedUser;
};

export const setAuthSession = ({ token, user }) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.localStorage.setItem(LEGACY_AUTH_TOKEN_KEY, token);
  }

  if (user && typeof user === 'object') {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  emitAuthSessionChanged();
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  emitAuthSessionChanged();
};

export const isAuthenticated = () => Boolean(getAuthToken());

export const isUnauthorizedError = (error) => Number(error?.status) === 401;

export const registerUser = async ({ name, email, password }) => {
  const data = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });

  if (!data?.user || typeof data.user !== 'object') {
    throw createApiError('Invalid registration response', 500, data);
  }

  return data;
};

export const loginUser = async ({ email, password }) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    const data = response?.data;

    if (!data || typeof data !== 'object') {
      throw createApiError('Invalid login response', Number(response?.status || 0), null);
    }

    if (data.success === false) {
      throw createApiError(data.message || 'Request failed', Number(response?.status || 0), data);
    }

    if (!data?.token || typeof data.token !== 'string') {
      throw createApiError('Invalid login response', Number(response?.status || 0), data);
    }

    return data;
  } catch (error) {
    if (error?.response) {
      throw normalizeAxiosError(error);
    }

    throw createApiError('Unable to connect to the server. Please try again.', 0, null);
  }
};

export const generateFlashcards = async (topic) => {
  const data = await apiRequest('/api/flashcards/generate', {
    method: 'POST',
    body: { topic },
    requiresAuth: true,
  });

  const flashcards = Array.isArray(data?.flashcards)
    ? data.flashcards
    : Array.isArray(data?.data)
      ? data.data
      : null;

  if (!Array.isArray(flashcards)) {
    throw createApiError('Invalid flashcard generation response', 500, data);
  }

  return flashcards;
};

export const saveFlashcards = async ({ topic, flashcards }) => {
  const data = await apiRequest('/api/flashcards/save', {
    method: 'POST',
    body: { topic, flashcards },
    requiresAuth: true,
  });

  if (!data?.data || typeof data.data !== 'object') {
    throw createApiError('Invalid save response', 500, data);
  }

  return data.data;
};

export const getMyFlashcards = async () => {
  const token = getAuthToken();

  if (!token) {
    throw createApiError('Please log in to continue.', 401, null);
  }

  try {
    const response = await api.get('/api/flashcards/my');
    const data = response?.data;

    if (!data || typeof data !== 'object' || !Array.isArray(data?.data)) {
      throw createApiError('Invalid saved flashcards response', Number(response?.status || 0), data);
    }

    if (data.success === false) {
      throw createApiError(data.message || 'Request failed', Number(response?.status || 0), data);
    }

    return data.data;
  } catch (error) {
    if (error?.response) {
      throw normalizeAxiosError(error);
    }

    throw createApiError('Unable to connect to the server. Please try again.', 0, null);
  }
};

export const getDashboardData = async () => {
  const data = await apiRequest('/api/dashboard', {
    method: 'GET',
    requiresAuth: true,
  });

  return {
    totalFlashcards: Number.isFinite(Number(data?.totalFlashcards)) ? Number(data.totalFlashcards) : 0,
    studyStreak: Number.isFinite(Number(data?.studyStreak)) ? Number(data.studyStreak) : 0,
    mastered: Number.isFinite(Number(data?.mastered)) ? Number(data.mastered) : 0,
    timeStudied: Number.isFinite(Number(data?.timeStudied)) ? Number(data.timeStudied) : 0,
    userName: typeof data?.userName === 'string' && data.userName.trim() ? data.userName.trim() : 'Learner',
    recentActivity: Array.isArray(data?.recentActivity) ? data.recentActivity : [],
  };
};
