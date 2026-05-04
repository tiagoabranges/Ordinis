import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ThemeToggle } from "../modules/financial-grid/components/ThemeToggle";
import { tokenStorageKey } from "../modules/financial-grid/hooks/useSession";
import type { ThemeMode } from "../modules/financial-grid/hooks/useTheme";

type DashboardOutletContext = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

type DashboardResponse = {
  consolidatedBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  upcomingPayables: Array<DashboardTransaction>;
  upcomingReceivables: Array<DashboardTransaction>;
  futureInstallments: Array<DashboardTransaction>;
  expensesByCategory: Array<{
    categoryId: string | null;
    total: number;
    category: { id: string; name: string; color: string | null } | null;
  }>;
  expensesByCostCenter: Array<{
    costCenterId: string | null;
    total: number;
    costCenter: { id: string; name: string; color: string | null } | null;
  }>;
  monthlyEvolution: Array<{ label: string; income: number; expense: number }>;
  comparison: {
    currentMonth: { income: number; expense: number };
    previousMonth: { income: number; expense: number };
  };
};

type DashboardTransaction = {
  id: string;
  title: string;
  amount: string | number;
  dueDate: string | null;
  account?: { name: string };
  category?: { name: string } | null;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const months = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const palette = ["#19c37d", "#d4af37", "#315d9b", "#bd302f", "#7c3aed"];

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function percent(value: number) {
  return `${Math.round(value)}%`;
}

function getCurrentFilters() {
  const now = new Date();
  return {
    day: "",
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
  };
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function buildAnalysis(data: DashboardResponse) {
  const expenseRate =
    data.monthlyIncome > 0 ? (data.monthlyExpense / data.monthlyIncome) * 100 : 0;
  const previousBalance =
    data.comparison.previousMonth.income - data.comparison.previousMonth.expense;
  const variation = data.monthlyBalance - previousBalance;
  const topCategory = [...data.expensesByCategory].sort(
    (a, b) => b.total - a.total,
  )[0];

  const messages = [
    data.monthlyBalance >= 0
      ? `O periodo esta positivo em ${currency(data.monthlyBalance)}.`
      : `O periodo esta negativo em ${currency(Math.abs(data.monthlyBalance))}.`,
    data.monthlyIncome > 0
      ? `As despesas consumiram ${percent(expenseRate)} das receitas.`
      : "Ainda nao ha receitas registradas neste periodo.",
    variation >= 0
      ? `O resultado melhorou ${currency(variation)} em relacao ao mes anterior.`
      : `O resultado caiu ${currency(Math.abs(variation))} em relacao ao mes anterior.`,
  ];

  if (topCategory) {
    messages.push(
      `Maior concentracao de gastos: ${topCategory.category?.name ?? "Sem categoria"} (${currency(topCategory.total)}).`,
    );
  }

  return messages;
}

function DonutChart({
  items,
}: {
  items: Array<{ label: string; total: number; color: string }>;
}) {
  const total = items.reduce((sum, item) => sum + item.total, 0);
  let offset = 25;

  if (total <= 0) {
    return <div className="dashboard-empty">Sem despesas no periodo.</div>;
  }

  return (
    <div className="donut-chart">
      <svg viewBox="0 0 42 42" aria-hidden="true">
        <circle className="donut-chart__base" cx="21" cy="21" r="15.9" />
        {items.map((item) => {
          const size = (item.total / total) * 100;
          const segment = (
            <circle
              className="donut-chart__segment"
              cx="21"
              cy="21"
              key={item.label}
              r="15.9"
              stroke={item.color}
              strokeDasharray={`${size} ${100 - size}`}
              strokeDashoffset={offset}
            />
          );
          offset -= size;
          return segment;
        })}
      </svg>
      <div className="chart-legend">
        {items.map((item) => (
          <div className="chart-legend__item" key={item.label}>
            <span style={{ backgroundColor: item.color }} />
            <strong>{item.label}</strong>
            <small>{currency(item.total)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { theme, toggleTheme } = useOutletContext<DashboardOutletContext>();
  const token = useMemo(() => localStorage.getItem(tokenStorageKey) ?? "", []);
  const [filters, setFilters] = useState(getCurrentFilters);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token) {
      return;
    }

    const params = new URLSearchParams();
    params.set("month", filters.month);
    params.set("year", filters.year);
    if (filters.day) {
      params.set("day", filters.day);
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "Falha ao carregar dashboard.");
      }

      setData((await response.json()) as DashboardResponse);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Falha ao carregar dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const categoryItems = useMemo(
    () =>
      (data?.expensesByCategory ?? [])
        .slice()
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map((item, index) => ({
          label: item.category?.name ?? "Sem categoria",
          total: item.total,
          color: item.category?.color ?? palette[index % palette.length],
        })),
    [data],
  );

  const maxEvolution = Math.max(
    1,
    ...(data?.monthlyEvolution ?? []).flatMap((item) => [
      item.income,
      item.expense,
    ]),
  );
  const maxCostCenter = Math.max(
    1,
    ...(data?.expensesByCostCenter ?? []).map((item) => item.total),
  );
  const analysis = data ? buildAnalysis(data) : [];

  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Visao financeira</h1>
        </div>
        <div className="topbar__actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {error ? <div className="alert">{error}</div> : null}

      <section className="dashboard-filters">
        <label className="field">
          <span>Dia</span>
          <input
            max="31"
            min="1"
            placeholder="Todos"
            type="number"
            value={filters.day}
            onChange={(event) =>
              setFilters((current) => ({ ...current, day: event.target.value }))
            }
          />
        </label>
        <label className="field">
          <span>Mes</span>
          <select
            value={filters.month}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                month: event.target.value,
              }))
            }
          >
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Ano</span>
          <input
            min="2000"
            type="number"
            value={filters.year}
            onChange={(event) =>
              setFilters((current) => ({ ...current, year: event.target.value }))
            }
          />
        </label>
        <button
          className="button button--primary"
          disabled={loading}
          onClick={loadDashboard}
        >
          {loading ? "Carregando..." : "Atualizar"}
        </button>
      </section>

      <section className="dashboard-kpis">
        <article className="summary-card">
          <span>Saldo consolidado</span>
          <strong>{currency(data?.consolidatedBalance ?? 0)}</strong>
          <small>Soma das contas considerando entradas, saidas e transferencias.</small>
        </article>
        <article className="summary-card summary-card--totalIncome">
          <span>Receitas</span>
          <strong>{currency(data?.monthlyIncome ?? 0)}</strong>
          <small>Total de entradas no periodo filtrado.</small>
        </article>
        <article className="summary-card summary-card--totalExpense">
          <span>Despesas</span>
          <strong>{currency(data?.monthlyExpense ?? 0)}</strong>
          <small>Total de gastos no periodo filtrado.</small>
        </article>
        <article className="summary-card summary-card--periodBalance">
          <span>Resultado</span>
          <strong>{currency(data?.monthlyBalance ?? 0)}</strong>
          <small>Receitas menos despesas.</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <header>
            <div>
              <span className="eyebrow">Pizza</span>
              <h2>Despesas por categoria</h2>
            </div>
          </header>
          <DonutChart items={categoryItems} />
        </article>

        <article className="dashboard-panel">
          <header>
            <div>
              <span className="eyebrow">Evolucao</span>
              <h2>Receitas x despesas</h2>
            </div>
          </header>
          <div className="bar-chart">
            {(data?.monthlyEvolution ?? []).map((item) => (
              <div className="bar-chart__group" key={item.label}>
                <div className="bar-chart__bars">
                  <span
                    className="bar-chart__bar bar-chart__bar--income"
                    style={{ height: `${(item.income / maxEvolution) * 100}%` }}
                  />
                  <span
                    className="bar-chart__bar bar-chart__bar--expense"
                    style={{ height: `${(item.expense / maxEvolution) * 100}%` }}
                  />
                </div>
                <small>{item.label.slice(5)}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <header>
            <div>
              <span className="eyebrow">Analise</span>
              <h2>Leitura do periodo</h2>
            </div>
          </header>
          <div className="analysis-list">
            {analysis.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <header>
            <div>
              <span className="eyebrow">Centros</span>
              <h2>Gastos por centro de custo</h2>
            </div>
          </header>
          <div className="rank-list">
            {(data?.expensesByCostCenter ?? []).map((item, index) => (
              <div className="rank-item" key={item.costCenterId ?? index}>
                <div>
                  <strong>{item.costCenter?.name ?? "Sem centro"}</strong>
                  <span>{currency(item.total)}</span>
                </div>
                <i style={{ width: `${(item.total / maxCostCenter) * 100}%` }} />
              </div>
            ))}
            {data && data.expensesByCostCenter.length === 0 ? (
              <div className="dashboard-empty">Sem centros de custo no periodo.</div>
            ) : null}
          </div>
        </article>

        <article className="dashboard-panel dashboard-panel--wide">
          <header>
            <div>
              <span className="eyebrow">Proximos 14 dias</span>
              <h2>Contas a pagar e receber</h2>
            </div>
          </header>
          <div className="dashboard-lists">
            <div>
              <h3>A pagar</h3>
              {(data?.upcomingPayables ?? []).slice(0, 5).map((item) => (
                <div className="mini-transaction" key={item.id}>
                  <span>{formatDate(item.dueDate)}</span>
                  <strong>{item.title}</strong>
                  <em>{currency(Number(item.amount))}</em>
                </div>
              ))}
              {data && data.upcomingPayables.length === 0 ? (
                <div className="dashboard-empty">Nada a pagar.</div>
              ) : null}
            </div>
            <div>
              <h3>A receber</h3>
              {(data?.upcomingReceivables ?? []).slice(0, 5).map((item) => (
                <div className="mini-transaction" key={item.id}>
                  <span>{formatDate(item.dueDate)}</span>
                  <strong>{item.title}</strong>
                  <em>{currency(Number(item.amount))}</em>
                </div>
              ))}
              {data && data.upcomingReceivables.length === 0 ? (
                <div className="dashboard-empty">Nada a receber.</div>
              ) : null}
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
