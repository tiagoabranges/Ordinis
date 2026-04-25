import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelTransaction,
  createTransaction,
  fetchAccounts,
  fetchCategories,
  fetchFinancialGrid,
  markTransactionPaid,
  updateTransaction,
} from "../services/financialGridService";
import type {
  AccountOption,
  CategoryOption,
  CreateTransactionPayload,
  FinancialGridFilters,
  FinancialGridResponse,
  UpdateTransactionPayload,
} from "../types/financialGrid.types";
import { tokenStorageKey } from "./useSession";

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
  const [token] = useState(() => localStorage.getItem(tokenStorageKey) ?? "");
  const [filters, setFilters] = useState(getInitialFilters);
  const [data, setData] = useState<FinancialGridResponse | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      loading,
      saving,
      cancel,
      load,
      markPaid,
      saveTransaction,
      updateFilters,
    }),
    [
      accounts,
      categories,
      data,
      error,
      filters,
      loading,
      saving,
      cancel,
      load,
      markPaid,
      saveTransaction,
      updateFilters,
    ],
  );
}
