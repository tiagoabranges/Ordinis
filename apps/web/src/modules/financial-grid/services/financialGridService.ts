import type {
  AccountOption,
  CategoryPayload,
  CategoryOption,
  CreateTransactionPayload,
  FinancialGridFilters,
  FinancialGridResponse,
  LoginResponse,
  UpdateTransactionPayload,
} from "../types/financialGrid.types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

function buildHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Falha ao comunicar com a API.");
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchFinancialGrid(
  filters: FinancialGridFilters,
  token: string,
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  return request<FinancialGridResponse>(`/financial-grid?${params}`, {
    headers: buildHeaders(token),
  });
}

export async function fetchAccounts(token: string) {
  return request<AccountOption[]>("/accounts", {
    headers: buildHeaders(token),
  });
}

export async function fetchCategories(token: string) {
  return request<CategoryOption[]>("/categories", {
    headers: buildHeaders(token),
  });
}

export async function createTransaction(
  payload: CreateTransactionPayload,
  token: string,
) {
  return request("/transactions", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionPayload,
  token: string,
) {
  return request(`/transactions/${id}`, {
    method: "PATCH",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function markTransactionPaid(id: string, token: string) {
  return request(`/transactions/${id}/mark-paid`, {
    method: "PATCH",
    headers: buildHeaders(token),
    body: JSON.stringify({ paidAt: new Date().toISOString() }),
  });
}

export async function cancelTransaction(id: string, token: string) {
  return request(`/transactions/${id}/cancel`, {
    method: "PATCH",
    headers: buildHeaders(token),
  });
}

export async function createCategory(payload: CategoryPayload, token: string) {
  return request<CategoryOption>("/categories", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  id: string,
  payload: Partial<CategoryPayload>,
  token: string,
) {
  return request<CategoryOption>(`/categories/${id}`, {
    method: "PATCH",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: string, token: string) {
  return request<{ success: boolean }>(`/categories/${id}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });
}
