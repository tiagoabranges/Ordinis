import { useState } from "react";
import type { FormEvent } from "react";
import type {
  AccountOption,
  CategoryOption,
  CreateTransactionPayload,
  FinancialGridItem,
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "../types/financialGrid.types";

type TransactionFormModalProps = {
  accounts: AccountOption[];
  categories: CategoryOption[];
  transaction?: FinancialGridItem | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: CreateTransactionPayload) => Promise<void>;
};

export function TransactionFormModal({
  accounts,
  categories,
  transaction,
  saving,
  onClose,
  onSave,
}: TransactionFormModalProps) {
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "EXPENSE",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    transaction?.paymentMethod ?? "PIX",
  );
  const [status, setStatus] = useState<TransactionStatus>(
    transaction?.status ?? "PENDING",
  );
  const [title, setTitle] = useState(transaction?.title ?? "");
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [accountId, setAccountId] = useState(
    transaction?.account.id ?? accounts[0]?.id ?? "",
  );
  const [destinationAccountId, setDestinationAccountId] = useState(
    transaction?.destinationAccount?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(transaction?.category?.id ?? "");
  const [transactionDate, setTransactionDate] = useState(
    (transaction?.date ?? new Date().toISOString()).slice(0, 10),
  );
  const [dueDate, setDueDate] = useState(
    transaction?.dueDate?.slice(0, 10) ?? "",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateTransactionPayload = {
      accountId,
      type,
      paymentMethod,
      title,
      amount: Number(amount),
      transactionDate,
      status,
      ...(categoryId && type !== "TRANSFER" ? { categoryId } : {}),
      ...(destinationAccountId && type === "TRANSFER"
        ? { destinationAccountId }
        : {}),
      ...(dueDate ? { dueDate } : {}),
    };

    await onSave(payload);
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <header>
          <h2>{transaction ? "Editar transacao" : "Nova transacao"}</h2>
          <button className="icon-button" onClick={onClose} type="button">
            x
          </button>
        </header>

        <div className="form-grid">
          <label className="field">
            <span>Descricao</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Valor</span>
            <input
              min="0.01"
              required
              step="0.01"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Tipo</span>
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as TransactionType)
              }
            >
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </label>

          <label className="field">
            <span>Conta</span>
            <select
              required
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>

          {type === "TRANSFER" ? (
            <label className="field">
              <span>Destino</span>
              <select
                required
                value={destinationAccountId}
                onChange={(event) =>
                  setDestinationAccountId(event.target.value)
                }
              >
                <option value="">Selecione</option>
                {accounts
                  .filter((account) => account.id !== accountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
            </label>
          ) : (
            <label className="field">
              <span>Categoria</span>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="field">
            <span>Forma</span>
            <select
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(event.target.value as PaymentMethod)
              }
            >
              <option value="PIX">PIX</option>
              <option value="CREDIT">Credito</option>
              <option value="DEBIT">Debito</option>
              <option value="BOLETO">Boleto</option>
              <option value="CASH">Dinheiro</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="OTHER">Outro</option>
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as TransactionStatus)
              }
            >
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="OVERDUE">Atrasado</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </label>

          <label className="field">
            <span>Data</span>
            <input
              required
              type="date"
              value={transactionDate}
              onChange={(event) => setTransactionDate(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Vencimento</span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
        </div>

        <footer>
          <button
            className="button button--ghost"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button className="button button--primary" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </footer>
      </form>
    </div>
  );
}
