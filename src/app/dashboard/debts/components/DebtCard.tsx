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
import MobilePaymentHistory from "./MobilePaymentHistory";

interface DebtCardProps {
  debt: Debt;
  search: string;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
  onPay: (id: string) => void;
}

/**
 * Card component that displays a debt's information and payment history.
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <DebtDetails debt={debt} search={search} />
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 lg:mt-0 lg:ml-6">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(debt);
                }}
                variant="text"
                className="p-2"
                aria-label="Edit Debt"
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
                aria-label="Delete Debt"
              >
                <TrashIcon className="h-5 w-5" />
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
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPay(debt.id);
              }}
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
              aria-label="Pay Debt"
            >
              Record Payment
            </Button>
          </div>
        </div>
        {isExpanded && (
          <>
            <div className="border-t border-gray-200 my-4" />
            <div className="px-0" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4">
                <div className="mb-3">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    className="sm:w-auto"
                    aria-label="Close Payment History"
                  >
                    Close
                  </Button>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    Payment History
                  </h4>
                  <p className="text-sm text-gray-500">
                    {debt.payments.length} payment
                    {debt.payments.length !== 1 ? "s" : ""} recorded
                  </p>
                </div>
              </div>

              {/* Mobile-friendly payment history */}
              <div className="lg:hidden">
                <MobilePaymentHistory payments={debt.payments} />
              </div>

              {/* Desktop table layout */}
              <div className="hidden lg:block">
                <Table
                  data={debt.payments as unknown as Record<string, unknown>[]}
                  columns={[
                    {
                      key: "date",
                      header: "Date",
                      accessor: (row) =>
                        new Date(
                          (row as unknown as DebtPayment).date,
                        ).toLocaleDateString(),
                      sortable: true,
                      filterable: true,
                    },
                    {
                      key: "amount",
                      header: "Amount",
                      accessor: (row) =>
                        `$${(row as unknown as DebtPayment).amount.toLocaleString()}`,
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
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
