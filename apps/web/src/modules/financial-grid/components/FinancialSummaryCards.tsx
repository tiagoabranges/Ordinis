import type { FinancialGridSummary } from "../types/financialGrid.types";
import { formatCurrency } from "./formatters";

type FinancialSummaryCardsProps = {
  summary?: FinancialGridSummary;
  loading: boolean;
};

const cards = [
  ["Receitas", "totalIncome", "Soma das receitas dentro do periodo filtrado."],
  ["Despesas", "totalExpense", "Soma das despesas dentro do periodo filtrado."],
  [
    "Saldo do periodo",
    "periodBalance",
    "Receitas menos despesas no periodo filtrado.",
  ],
  [
    "Em aberto",
    "totalPending",
    "Transacoes pendentes dentro do periodo filtrado.",
  ],
] as const;

export function FinancialSummaryCards({
  summary,
  loading,
}: FinancialSummaryCardsProps) {
  return (
    <section className="summary-grid">
      {cards.map(([label, key, description]) => (
        <article className={`summary-card summary-card--${key}`} key={key}>
          <span>{label}</span>
          <strong>
            {loading ? "..." : formatCurrency(summary?.[key] ?? 0)}
          </strong>
          <small>{description}</small>
        </article>
      ))}
    </section>
  );
}
