export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type TransactionStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELED";
export type PaymentMethod =
  | "PIX"
  | "CREDIT"
  | "DEBIT"
  | "BOLETO"
  | "CASH"
  | "TRANSFER"
  | "OTHER";

export type AccountOption = {
  id: string;
  name: string;
  type: string;
};

export type CategoryOption = {
  id: string;
  userId?: string | null;
  name: string;
  type?: string;
  color?: string | null;
  icon?: string | null;
  slug?: string;
  isDefault?: boolean;
  isSystem?: boolean;
  keywords?: string[];
};

export type FinancialGridSummary = {
  totalIncome: number;
  totalExpense: number;
  periodBalance: number;
  totalPending: number;
};

export type FinancialGridPagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type FinancialInstallment = {
  id: string;
  date: string;
  dueDate: string | null;
  title: string;
  amount: number;
  status: TransactionStatus;
  installmentNumber: number | null;
  totalInstallments: number | null;
  account: AccountOption;
  category: CategoryOption | null;
  costCenter: {
    id: string;
    name: string;
    color: string | null;
  } | null;
};

export type FinancialGridItem = {
  id: string;
  transactionId: string;
  date: string;
  dueDate: string | null;
  title: string;
  description: string | null;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  amount: number;
  status: TransactionStatus;
  account: AccountOption;
  destinationAccount: AccountOption | null;
  category: CategoryOption | null;
  costCenter: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  installment: {
    groupId: string;
    current: number | null;
    total: number;
    totalAmount: number;
    isExpandable: boolean;
  } | null;
  installments: FinancialInstallment[];
  source: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FinancialGridFilters = {
  page: number;
  perPage: number;
  startDate: string;
  endDate: string;
  type: "" | TransactionType;
  accountId: string;
  categoryId: string;
  status: "" | TransactionStatus;
  search: string;
};

export type FinancialGridResponse = {
  summary: FinancialGridSummary;
  items: FinancialGridItem[];
  pagination: FinancialGridPagination;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
};

export type CreateTransactionPayload = {
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  title: string;
  description?: string;
  amount: number;
  transactionDate: string;
  dueDate?: string;
  status: TransactionStatus;
};

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export type CategoryType = "INCOME" | "EXPENSE" | "BOTH";

export type CategoryPayload = {
  name: string;
  slug: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  keywords?: string[];
};
