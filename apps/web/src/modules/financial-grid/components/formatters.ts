import type {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "../types/financialGrid.types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatTransactionType(type: TransactionType) {
  const labels: Record<TransactionType, string> = {
    EXPENSE: "Despesa",
    INCOME: "Receita",
    TRANSFER: "Transferencia",
  };

  return labels[type];
}

export function formatStatus(status: TransactionStatus) {
  const labels: Record<TransactionStatus, string> = {
    CANCELED: "Cancelado",
    OVERDUE: "Atrasado",
    PAID: "Pago",
    PENDING: "Pendente",
  };

  return labels[status];
}

export function formatPaymentMethod(method: PaymentMethod) {
  const labels: Record<PaymentMethod, string> = {
    BOLETO: "Boleto",
    CASH: "Dinheiro",
    CREDIT: "Credito",
    DEBIT: "Debito",
    OTHER: "Outro",
    PIX: "PIX",
    TRANSFER: "Transferencia",
  };

  return labels[method];
}
