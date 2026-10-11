// ===========================================================
// Centralized Axios instance.
//
// Every future service (studentService, courseService, ...)
// should import `api` from here rather than creating its own
// axios instance. This is the ONE place that needs to change
// when the real backend goes live: base URL, auth header
// injection, and error normalization all live here.
//
// While services still return mock data, this instance is
// unused but kept wired up and ready.
// ===========================================================

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the stored access token to every outgoing request, once
// the backend exists and issues one. Reads from the same place
// authService writes to, so the two stay in sync.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('sc_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error shape so UI can rely on `error.message` regardless
// of whether it's a network failure or a backend-returned error body.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...error, message });
  }
);

export default api;
