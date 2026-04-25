import { useCallback, useMemo, useState } from "react";
import { login } from "../services/financialGridService";
import type { LoginResponse } from "../types/financialGrid.types";

export const tokenStorageKey = "ordinis.accessToken";
export const userStorageKey = "ordinis.user";

export function useSession() {
  const [token, setToken] = useState(
    () => localStorage.getItem(tokenStorageKey) ?? "",
  );
  const [user, setUser] = useState<LoginResponse["user"] | null>(() => {
    const stored = localStorage.getItem(userStorageKey);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      const session = await login(email, password);
      localStorage.setItem(tokenStorageKey, session.accessToken);
      localStorage.setItem(userStorageKey, JSON.stringify(session.user));
      setToken(session.accessToken);
      setUser(session.user);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Falha no login.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(userStorageKey);
    setToken("");
    setUser(null);
  }, []);

  return useMemo(
    () => ({
      error,
      isAuthenticated: Boolean(token),
      loading,
      token,
      user,
      setError,
      signIn,
      signOut,
    }),
    [error, loading, signIn, signOut, token, user],
  );
}
