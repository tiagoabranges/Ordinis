import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFinancialGrid } from "../hooks/useFinancialGrid";
import type { ThemeMode } from "../hooks/useTheme";
import { FinancialFilters } from "./FinancialFilters";
import { FinancialSummaryCards } from "./FinancialSummaryCards";
import { FinancialTransactionsTable } from "./FinancialTransactionsTable";
import { ThemeToggle } from "./ThemeToggle";
import { TransactionFormModal } from "./TransactionFormModal";
import type { FinancialGridItem } from "../types/financialGrid.types";

type FinancialGridOutletContext = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

export function FinancialGridPage() {
  const grid = useFinancialGrid();
  const { theme, toggleTheme } = useOutletContext<FinancialGridOutletContext>();
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

  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">Planilha</span>
          <h1>Planilha financeira</h1>
        </div>
        <div className="topbar__actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
    </>
  );
}
