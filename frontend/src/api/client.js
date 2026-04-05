import axios from 'axios';

const DEFAULT_API_URL = 'https://learnin5-ai-flashcards.onrender.com';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, ''),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('learnin5_token') || window.localStorage.getItem('token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
