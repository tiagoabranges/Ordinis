import { useState } from "react";
import { useFinancialGrid } from "../hooks/useFinancialGrid";
import { useTheme } from "../hooks/useTheme";
import { FinancialFilters } from "./FinancialFilters";
import { FinancialSummaryCards } from "./FinancialSummaryCards";
import { FinancialTransactionsTable } from "./FinancialTransactionsTable";
import { LoginPanel } from "./LoginPanel";
import { ThemeToggle } from "./ThemeToggle";
import { TransactionFormModal } from "./TransactionFormModal";
import type { FinancialGridItem } from "../types/financialGrid.types";

export function FinancialGridPage() {
  const grid = useFinancialGrid();
  const { theme, toggleTheme } = useTheme();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinancialGridItem | null>(
    null,
  );

  function openCreateModal() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function openEditModal(item: FinancialGridItem) {
    setEditingItem(item);
    setModalOpen(true);
  }

  function closeModal() {
    setEditingItem(null);
    setModalOpen(false);
  }

  if (!grid.isAuthenticated) {
    return (
      <main className="app-shell app-shell--auth">
        <div className="auth-theme">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <LoginPanel
          error={grid.error}
          loading={grid.loading}
          onSubmit={grid.signIn}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="eyebrow">Ordinis</span>
          <h1>Planilha financeira</h1>
        </div>
        <div className="topbar__actions">
          <span>{grid.user?.fullName}</span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button className="button button--ghost" onClick={grid.signOut}>
            Sair
          </button>
          <button className="button button--primary" onClick={openCreateModal}>
            Nova transacao
          </button>
        </div>
      </header>

      {grid.error ? <div className="alert">{grid.error}</div> : null}

      <FinancialSummaryCards
        summary={grid.data?.summary}
        loading={grid.loading}
      />

      <FinancialFilters
        accounts={grid.accounts}
        categories={grid.categories}
        filters={grid.filters}
        onChange={grid.updateFilters}
        onRefresh={grid.load}
      />

      <FinancialTransactionsTable
        items={grid.data?.items ?? []}
        loading={grid.loading}
        pagination={grid.data?.pagination}
        onCancel={grid.cancel}
        onEdit={openEditModal}
        onMarkPaid={grid.markPaid}
        onPageChange={(page) => grid.updateFilters({ page })}
      />

      {isModalOpen ? (
        <TransactionFormModal
          accounts={grid.accounts}
          categories={grid.categories}
          transaction={editingItem}
          saving={grid.saving}
          onClose={closeModal}
          onSave={async (payload) => {
            await grid.saveTransaction(payload, editingItem?.transactionId);
            closeModal();
          }}
        />
      ) : null}
    </main>
  );
}
