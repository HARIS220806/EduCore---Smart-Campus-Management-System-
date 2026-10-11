import { createContext, useEffect, useState, useCallback } from 'react';
import authService from '@/services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rehydrate session on first load (e.g. page refresh)
  useEffect(() => {
    let active = true;
    (async () => {
      const session = await authService.getCurrentUser();
      if (active) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    const { user: loggedInUser } = await authService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    setError(null);
    const { user: loggedInUser } = await authService.loginWithGoogle(credential);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    loading,
    error,
    login,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
