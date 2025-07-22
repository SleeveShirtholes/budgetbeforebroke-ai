import HighlightedText from "@/components/Table/HighlightedText";
import { Debt } from "@/types/debt";

interface DebtDetailsProps {
  debt: Debt;
  search: string;
}

/**
 * Displays detailed information about a recurring debt.
 * Shows the debt name, balance, interest rate, and due date.
 * Supports text highlighting for search functionality.
 */
export default function DebtDetails({ debt, search }: DebtDetailsProps) {
  return (
    <div className="flex-1">
      <div className="text-lg font-bold text-primary-600 mb-1">
        <HighlightedText text={debt.name} highlight={search} />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-gray-700">
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            Balance
          </span>
          <span className="text-base font-semibold text-gray-900">
            <HighlightedText text={`$${debt.balance.toLocaleString()}`} highlight={search} />
          </span>
        </div>
        <div className="hidden sm:block h-8 border-l border-gray-200 mx-2"></div>
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            Interest Rate
          </span>
          <span className="text-base font-semibold text-gray-900">
            <HighlightedText
              text={`${debt.interestRate}%`}
              highlight={search}
            />
          </span>
        </div>
        <div className="hidden sm:block h-8 border-l border-gray-200 mx-2"></div>
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            Due Date
          </span>
          <span className="text-base font-semibold text-gray-900">
            <HighlightedText
              text={new Date(debt.dueDate).toLocaleDateString()}
              highlight={search}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
