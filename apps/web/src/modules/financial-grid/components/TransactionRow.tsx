import type { FinancialGridItem } from "../types/financialGrid.types";
import {
  formatCurrency,
  formatDate,
  formatPaymentMethod,
  formatStatus,
  formatTransactionType,
} from "./formatters";

type TransactionRowProps = {
  item: FinancialGridItem;
  expanded: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onMarkPaid: () => void;
  onToggle: () => void;
};

export function TransactionRow({
  item,
  expanded,
  onCancel,
  onEdit,
  onMarkPaid,
  onToggle,
}: TransactionRowProps) {
  return (
    <tr>
      <td className="cell-toggle">
        {item.installment?.isExpandable ? (
          <button
            aria-label={expanded ? "Recolher parcelas" : "Expandir parcelas"}
            className="icon-button"
            onClick={onToggle}
          >
            {expanded ? "-" : "+"}
          </button>
        ) : null}
      </td>
      <td>{formatDate(item.date)}</td>
      <td>
        <strong>{item.title}</strong>
        {item.description ? <small>{item.description}</small> : null}
      </td>
      <td>
        <span className={`pill pill--${item.type.toLowerCase()}`}>
          {formatTransactionType(item.type)}
        </span>
      </td>
      <td>{item.account.name}</td>
      <td>{item.category?.name ?? "-"}</td>
      <td>{formatPaymentMethod(item.paymentMethod)}</td>
      <td className={`money money--${item.type.toLowerCase()}`}>
        {formatCurrency(item.amount)}
      </td>
      <td>
        <span className={`status status--${item.status.toLowerCase()}`}>
          {formatStatus(item.status)}
        </span>
      </td>
      <td>{item.installment ? `${item.installment.total}x` : "-"}</td>
      <td>
        <div className="table-actions">
          <button className="button button--table" onClick={onEdit}>
            Editar
          </button>
          {item.status !== "PAID" && item.status !== "CANCELED" ? (
            <button className="button button--table" onClick={onMarkPaid}>
              Pagar
            </button>
          ) : null}
          {item.status !== "CANCELED" ? (
            <button
              className="button button--table button--danger"
              onClick={onCancel}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
