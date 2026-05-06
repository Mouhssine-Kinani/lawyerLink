import { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../api/auth.api";

export const AuthContext = createContext(null);

const TOKEN_KEY = "lawyerlink_token";
const USER_KEY = "lawyerlink_user";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function decodeJwtRole(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "client";
  } catch {
    return "client";
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken);
  const [user, setUser] = useState(getUser);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    const currentToken = getToken();
    if (currentToken) {
      try {
        await authApi.logout(currentToken);
      } catch {
        // ignore logout errors — always clear local state
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);

      const userObj = {
        email,
        role: decodeJwtRole(data.access_token),
      };
      localStorage.setItem(USER_KEY, JSON.stringify(userObj));

      setToken(data.access_token);
      setUser(userObj);
      return userObj;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const data = await authApi.register(payload);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
