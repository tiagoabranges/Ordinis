import type { FinancialInstallment } from "../types/financialGrid.types";
import { formatCurrency, formatDate, formatStatus } from "./formatters";

type InstallmentsExpandedRowProps = {
  installments: FinancialInstallment[];
};

export function InstallmentsExpandedRow({
  installments,
}: InstallmentsExpandedRowProps) {
  return (
    <tr className="expanded-row">
      <td></td>
      <td colSpan={10}>
        <div className="installments-list">
          {installments.map((installment) => (
            <div className="installment-item" key={installment.id}>
              <span>{formatDate(installment.date)}</span>
              <strong>{installment.title}</strong>
              <span>
                {installment.installmentNumber}/{installment.totalInstallments}
              </span>
              <span>{installment.account.name}</span>
              <span>{formatCurrency(installment.amount)}</span>
              <span
                className={`status status--${installment.status.toLowerCase()}`}
              >
                {formatStatus(installment.status)}
              </span>
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
}
