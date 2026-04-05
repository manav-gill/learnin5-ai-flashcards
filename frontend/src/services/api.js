const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

const AUTH_TOKEN_KEY = 'learnin5_token';
const AUTH_USER_KEY = 'learnin5_user';

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

const buildApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

const createApiError = (message, status = 0, data = null) => {
  const error = new Error(message || 'Request failed');
  error.status = status;
  error.data = data;
  return error;
};

const parseApiResponse = async (response) => {
  const rawBody = await response.text();
  const data = safeJsonParse(rawBody);

  if (!response.ok) {
    throw createApiError(
      data?.message || `Request failed (${response.status})`,
      response.status,
      data
    );
  }

  if (!data || typeof data !== 'object') {
    throw createApiError('Invalid server response', response.status, null);
  }

  if (data.success === false) {
    throw createApiError(data.message || 'Request failed', response.status, data);
  }

  return data;
};

const apiRequest = async (path, { method = 'GET', body, requiresAuth = false, headers = {} } = {}) => {
  const token = getAuthToken();

  if (requiresAuth && !token) {
    throw createApiError('Please log in to continue.', 401, null);
  }

  const requestHeaders = {
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (requiresAuth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(buildApiUrl(path), {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw createApiError('Unable to connect to the server. Please try again.', 0, null);
  }

  return parseApiResponse(response);
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY) || '';
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
  }

  if (user && typeof user === 'object') {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
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
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (!data?.token || typeof data.token !== 'string') {
    throw createApiError('Invalid login response', 500, data);
  }

  return data;
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
  const data = await apiRequest('/api/flashcards/my', {
    method: 'GET',
    requiresAuth: true,
  });

  if (!Array.isArray(data?.data)) {
    throw createApiError('Invalid saved flashcards response', 500, data);
  }

  return data.data;
};
