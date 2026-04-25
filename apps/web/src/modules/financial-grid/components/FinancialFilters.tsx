import type {
  AccountOption,
  CategoryOption,
  FinancialGridFilters,
  TransactionStatus,
  TransactionType,
} from "../types/financialGrid.types";

type FinancialFiltersProps = {
  accounts: AccountOption[];
  categories: CategoryOption[];
  filters: FinancialGridFilters;
  onChange: (patch: Partial<FinancialGridFilters>) => void;
  onRefresh: () => void;
};

const transactionTypes: Array<{ label: string; value: "" | TransactionType }> =
  [
    { label: "Todos", value: "" },
    { label: "Receita", value: "INCOME" },
    { label: "Despesa", value: "EXPENSE" },
    { label: "Transferencia", value: "TRANSFER" },
  ];

const statuses: Array<{ label: string; value: "" | TransactionStatus }> = [
  { label: "Todos", value: "" },
  { label: "Pago", value: "PAID" },
  { label: "Pendente", value: "PENDING" },
  { label: "Atrasado", value: "OVERDUE" },
  { label: "Cancelado", value: "CANCELED" },
];

export function FinancialFilters({
  accounts,
  categories,
  filters,
  onChange,
  onRefresh,
}: FinancialFiltersProps) {
  return (
    <section className="filters-bar">
      <label className="field">
        <span>Inicio</span>
        <input
          type="date"
          value={filters.startDate}
          onChange={(event) => onChange({ startDate: event.target.value })}
        />
      </label>

      <label className="field">
        <span>Fim</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(event) => onChange({ endDate: event.target.value })}
        />
      </label>

      <label className="field">
        <span>Tipo</span>
        <select
          value={filters.type}
          onChange={(event) =>
            onChange({ type: event.target.value as "" | TransactionType })
          }
        >
          {transactionTypes.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Conta</span>
        <select
          value={filters.accountId}
          onChange={(event) => onChange({ accountId: event.target.value })}
        >
          <option value="">Todas</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Categoria</span>
        <select
          value={filters.categoryId}
          onChange={(event) => onChange({ categoryId: event.target.value })}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Status</span>
        <select
          value={filters.status}
          onChange={(event) =>
            onChange({ status: event.target.value as "" | TransactionStatus })
          }
        >
          {statuses.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field field--search">
        <span>Busca</span>
        <input
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Descricao, nota..."
        />
      </label>

      <button className="button button--ghost" onClick={onRefresh}>
        Atualizar
      </button>
    </section>
  );
}
