import { Fragment, useState } from "react";
import type {
  FinancialGridItem,
  FinancialGridPagination,
} from "../types/financialGrid.types";
import { InstallmentsExpandedRow } from "./InstallmentsExpandedRow";
import { TransactionRow } from "./TransactionRow";

type FinancialTransactionsTableProps = {
  items: FinancialGridItem[];
  loading: boolean;
  pagination?: FinancialGridPagination;
  onCancel: (transactionId: string) => void;
  onEdit: (item: FinancialGridItem) => void;
  onMarkPaid: (transactionId: string) => void;
  onPageChange: (page: number) => void;
};

export function FinancialTransactionsTable({
  items,
  loading,
  pagination,
  onCancel,
  onEdit,
  onMarkPaid,
  onPageChange,
}: FinancialTransactionsTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <section className="table-shell">
      <div className="table-scroll">
        <table className="transactions-table">
          <thead>
            <tr>
              <th></th>
              <th>Data</th>
              <th>Descricao</th>
              <th>Tipo</th>
              <th>Conta</th>
              <th>Categoria</th>
              <th>Forma</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Parcelas</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="state-cell">
                  Carregando...
                </td>
              </tr>
            ) : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={11} className="state-cell">
                  Nenhuma transacao encontrada.
                </td>
              </tr>
            ) : null}

            {!loading
              ? items.map((item) => (
                  <Fragment key={item.id}>
                    <TransactionRow
                      item={item}
                      expanded={Boolean(expanded[item.id])}
                      onCancel={() => onCancel(item.transactionId)}
                      onEdit={() => onEdit(item)}
                      onMarkPaid={() => onMarkPaid(item.transactionId)}
                      onToggle={() =>
                        setExpanded((current) => ({
                          ...current,
                          [item.id]: !current[item.id],
                        }))
                      }
                    />
                    {expanded[item.id] ? (
                      <InstallmentsExpandedRow
                        installments={item.installments}
                      />
                    ) : null}
                  </Fragment>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <footer className="pagination">
        <span>
          Pagina {pagination?.page ?? 1} de {pagination?.totalPages ?? 1} -{" "}
          {pagination?.total ?? 0} registros
        </span>
        <div>
          <button
            className="button button--ghost"
            disabled={!pagination || pagination.page <= 1}
            onClick={() => onPageChange((pagination?.page ?? 1) - 1)}
          >
            Anterior
          </button>
          <button
            className="button button--ghost"
            disabled={
              !pagination ||
              pagination.totalPages === 0 ||
              pagination.page >= pagination.totalPages
            }
            onClick={() => onPageChange((pagination?.page ?? 1) + 1)}
          >
            Proxima
          </button>
        </div>
      </footer>
    </section>
  );
}
