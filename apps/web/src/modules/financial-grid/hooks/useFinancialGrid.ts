import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelTransaction,
  createTransaction,
  fetchAccounts,
  fetchCategories,
  fetchFinancialGrid,
  login,
  markTransactionPaid,
  updateTransaction,
} from "../services/financialGridService";
import type {
  AccountOption,
  CategoryOption,
  CreateTransactionPayload,
  FinancialGridFilters,
  FinancialGridResponse,
  LoginResponse,
  UpdateTransactionPayload,
} from "../types/financialGrid.types";

const tokenStorageKey = "ordinis.accessToken";
const userStorageKey = "ordinis.user";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getInitialFilters(): FinancialGridFilters {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    page: 1,
    perPage: 20,
    startDate: toDateInput(start),
    endDate: toDateInput(end),
    type: "",
    accountId: "",
    categoryId: "",
    status: "",
    search: "",
  };
}

export function useFinancialGrid() {
  const [token, setToken] = useState(
    () => localStorage.getItem(tokenStorageKey) ?? "",
  );
  const [user, setUser] = useState<LoginResponse["user"] | null>(() => {
    const stored = localStorage.getItem(userStorageKey);
    return stored ? JSON.parse(stored) : null;
  });
  const [filters, setFilters] = useState(getInitialFilters);
  const [data, setData] = useState<FinancialGridResponse | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAuthenticated = Boolean(token);

  const updateFilters = useCallback((patch: Partial<FinancialGridFilters>) => {
    setFilters((current) => ({
      ...current,
      ...patch,
      page: patch.page ?? 1,
    }));
  }, []);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [grid, accountList, categoryList] = await Promise.all([
        fetchFinancialGrid(filters, token),
        fetchAccounts(token),
        fetchCategories(token),
      ]);
      setData(grid);
      setAccounts(accountList);
      setCategories(categoryList);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Falha ao carregar dados.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

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
    setData(null);
  }, []);

  const saveTransaction = useCallback(
    async (payload: CreateTransactionPayload, transactionId?: string) => {
      if (!token) {
        return;
      }

      setSaving(true);
      setError("");

      try {
        if (transactionId) {
          await updateTransaction(
            transactionId,
            payload as UpdateTransactionPayload,
            token,
          );
        } else {
          await createTransaction(payload, token);
        }
        await load();
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Falha ao salvar transacao.";
        setError(message);
        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [load, token],
  );

  const markPaid = useCallback(
    async (transactionId: string) => {
      if (!token) {
        return;
      }

      setSaving(true);
      setError("");

      try {
        await markTransactionPaid(transactionId, token);
        await load();
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Falha ao marcar como pago.";
        setError(message);
      } finally {
        setSaving(false);
      }
    },
    [load, token],
  );

  const cancel = useCallback(
    async (transactionId: string) => {
      if (!token) {
        return;
      }

      setSaving(true);
      setError("");

      try {
        await cancelTransaction(transactionId, token);
        await load();
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Falha ao cancelar transacao.";
        setError(message);
      } finally {
        setSaving(false);
      }
    },
    [load, token],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return useMemo(
    () => ({
      accounts,
      categories,
      data,
      error,
      filters,
      isAuthenticated,
      loading,
      saving,
      user,
      cancel,
      load,
      markPaid,
      saveTransaction,
      signIn,
      signOut,
      updateFilters,
    }),
    [
      accounts,
      categories,
      data,
      error,
      filters,
      isAuthenticated,
      loading,
      saving,
      user,
      cancel,
      load,
      markPaid,
      saveTransaction,
      signIn,
      signOut,
      updateFilters,
    ],
  );
}
