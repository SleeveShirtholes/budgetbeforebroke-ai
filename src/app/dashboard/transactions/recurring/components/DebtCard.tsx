import { Debt, DebtPayment } from "@/types/debt";
import {
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import Button from "@/components/Button";
import Table from "@/components/Table/Table";
import { useState } from "react";
import DebtDetails from "./DebtDetails";

interface DebtCardProps {
  debt: Debt;
  search: string;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
  onPay: (id: string) => void;
}

/**
 * Card component that displays a recurring debt's information and payment history.
 * Features expandable payment history, edit/delete actions, and payment functionality.
 * Supports search highlighting and responsive layout for different screen sizes.
 */
export default function DebtCard({
  debt,
  search,
  onEdit,
  onDelete,
  onPay,
}: DebtCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleHistory = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest("button") || e.target.tagName === "BUTTON")
    ) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-4">
      <div
        className={`bg-white/80 shadow-md rounded-xl px-6 py-1.5 border border-gray-200 hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer relative group`}
        onClick={toggleHistory}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <DebtDetails debt={debt} search={search} />
          <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:ml-6">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(debt);
              }}
              variant="text"
              className="p-2"
              aria-label="Edit Recurring"
            >
              <PencilIcon className="h-5 w-5" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(debt.id);
              }}
              variant="text"
              className="p-2 text-red-500 hover:text-red-700"
              aria-label="Delete Recurring"
            >
              <TrashIcon className="h-5 w-5" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPay(debt.id);
              }}
              variant="secondary"
              size="sm"
              className="p-2"
              aria-label="Pay Recurring"
            >
              Record Payment
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              variant="text"
              size="sm"
              className="p-2"
              aria-label="Toggle Payment History"
            >
              <ChevronDownIcon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isExpanded ? "transform rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        </div>
        {isExpanded && (
          <>
            <div className="border-t border-gray-200 my-4" />
            <div className="px-0" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Payment History
                </h4>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  variant="secondary"
                  size="sm"
                  aria-label="Close Payment History"
                >
                  Close
                </Button>
              </div>
              <Table
                data={debt.payments as unknown as Record<string, unknown>[]}
                columns={[
                  {
                    key: "date",
                    header: "Date",
                    accessor: (row) =>
                      new Date((row as unknown as DebtPayment).date).toLocaleDateString(),
                    sortable: true,
                    filterable: true,
                  },
                  {
                    key: "amount",
                    header: "Amount",
                    accessor: (row) => `$${(row as unknown as DebtPayment).amount.toLocaleString()}`,
                    sortable: true,
                    filterable: true,
                  },
                  {
                    key: "note",
                    header: "Note",
                    accessor: (row) =>
                      (row as unknown as DebtPayment).note || (
                        <span className="text-gray-400">—</span>
                      ),
                  },
                ]}
                pageSize={5}
                showPagination={true}
                className="bg-secondary-50 rounded-lg border border-secondary-100"
              />
              {debt.payments.length === 0 && (
                <div className="text-sm text-gray-500 p-4">
                  No payments yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
