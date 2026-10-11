// ===========================================================
// authService — MOCK IMPLEMENTATION
//
// Every function here mirrors the shape the real backend will
// eventually return, so AuthContext and pages never need to
// change when this is rewired to call the real API:
//
//   POST /api/auth/login   -> { user, role, accessToken }
//   POST /api/auth/register
//   GET  /api/auth/me      -> { user, role }
//
// Token storage: sessionStorage (cleared when the tab closes)
// is used here rather than localStorage, since an access token
// in localStorage is readable by any script on the page for the
// lifetime of the browser profile — a wider XSS blast radius.
// For a real deployment, prefer an httpOnly cookie set by the
// backend over any client-readable storage; sessionStorage is a
// reasonable middle ground for this project's scope. This is
// documented here so the choice is deliberate, not accidental.
// ===========================================================

import api from './api';

const TOKEN_KEY = 'sc_access_token';
const USER_KEY = 'sc_user';

export const authService = {
  async login({ email, password, rememberMe }) {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken } = response.data;
    
    // Normalize role to uppercase to match frontend constants (ADMIN, STUDENT, etc.)
    const role = response.data.role.toUpperCase();
    user.role = role;

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, accessToken);
    storage.setItem(USER_KEY, JSON.stringify(user));

    return { user, role, accessToken };
  },

  async loginWithGoogle(credential) {
    const response = await api.post('/auth/google', { credential });
    const { user, accessToken } = response.data;
    
    const role = response.data.role.toUpperCase();
    user.role = role;

    const storage = sessionStorage;
    storage.setItem(TOKEN_KEY, accessToken);
    storage.setItem(USER_KEY, JSON.stringify(user));

    return { user, role, accessToken };
  },

  async register({ name, email, password, role }) {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { user, accessToken } = response.data;

    const normalizedRole = response.data.role.toUpperCase();
    user.role = normalizedRole;

    const storage = sessionStorage;
    storage.setItem(TOKEN_KEY, accessToken);
    storage.setItem(USER_KEY, JSON.stringify(user));

    return { user, role: normalizedRole, accessToken };
  },

  async logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async forgotPassword({ email }) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async updateProfile(payload) {
    const response = await api.put('/auth/me', payload);
    const updatedUser = response.data.user;
    if (updatedUser) {
      const storedRaw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
      const storage = sessionStorage.getItem(USER_KEY) ? sessionStorage : localStorage;
      if (storedRaw) {
        const currentUser = JSON.parse(storedRaw);
        const merged = { ...currentUser, ...updatedUser };
        storage.setItem(USER_KEY, JSON.stringify(merged));
      }
    }
    return response.data;
  },

  async changePassword(payload) {
    const response = await api.post('/auth/change-password', payload);
    return response.data;
  },

  async getCurrentUser() {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);

    if (!raw || !token) return null;

    try {
      return { user: JSON.parse(raw), accessToken: token };
    } catch {
      return null;
    }
  },
};

export default authService;
