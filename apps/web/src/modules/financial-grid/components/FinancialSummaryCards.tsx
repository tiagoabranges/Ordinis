import type { FinancialGridSummary } from "../types/financialGrid.types";
import { formatCurrency } from "./formatters";

type FinancialSummaryCardsProps = {
  summary?: FinancialGridSummary;
  loading: boolean;
};

const cards = [
  ["Receitas", "totalIncome"],
  ["Despesas", "totalExpense"],
  ["Saldo", "periodBalance"],
  ["Pendente", "totalPending"],
] as const;

export function FinancialSummaryCards({
  summary,
  loading,
}: FinancialSummaryCardsProps) {
  return (
    <section className="summary-grid">
      {cards.map(([label, key]) => (
        <article className={`summary-card summary-card--${key}`} key={key}>
          <span>{label}</span>
          <strong>
            {loading ? "..." : formatCurrency(summary?.[key] ?? 0)}
          </strong>
        </article>
      ))}
    </section>
  );
}
