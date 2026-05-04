import { useCallback, useMemo, useState } from "react";
import { login, register } from "../services/financialGridService";
import type {
  LoginResponse,
  RegisterPayload,
} from "../types/financialGrid.types";

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
  const [success, setSuccess] = useState("");

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

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

  const signUp = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await register(payload);
      setSuccess(response.message);
      return true;
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Falha no cadastro.";
      setError(message);
      return false;
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
      success,
      token,
      user,
      setError,
      setSuccess,
      signIn,
      signUp,
      signOut,
    }),
    [error, loading, signIn, signOut, signUp, success, token, user],
  );
}
