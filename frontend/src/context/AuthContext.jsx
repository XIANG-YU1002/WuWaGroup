import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentSession, login as loginRequest } from "../api/auth.js";
import { clearToken, getToken, setToken } from "../api/tokenStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const loadSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const response = await getCurrentSession(token);
      setUser(response.data);
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadSession().finally(() => setInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email, password) => {
      const response = await loginRequest({ email, password });
      setToken(response.data.access_token);
      await loadSession();
    },
    [loadSession],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const refreshSession = useCallback(() => loadSession(), [loadSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      initializing,
      token: getToken(),
      login,
      logout,
      refreshSession,
    }),
    [user, initializing, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth 必須在 AuthProvider 內使用。");
  }
  return context;
}
