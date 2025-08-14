import { useState } from "react";
import {
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { formatDateSafely } from "@/utils/date";
import type { DebtInfo, PaycheckInfo } from "@/app/actions/paycheck-planning";

interface MobileDebtSelectorProps {
  debts: DebtInfo[];
  paychecks: PaycheckInfo[];
  onDebtAssigned: (
    debtId: string,
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => Promise<void>;
}

export default function MobileDebtSelector({
  debts,
  paychecks,
  onDebtAssigned,
}: MobileDebtSelectorProps) {
  const [selectedDebt, setSelectedDebt] = useState<DebtInfo | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleDebtSelect = (debt: DebtInfo) => {
    setSelectedDebt(debt);
  };

  const handlePaycheckSelect = async (paycheck: PaycheckInfo) => {
    if (!selectedDebt) return;

    setIsAssigning(true);
    try {
      await onDebtAssigned(
        selectedDebt.id,
        paycheck.id,
        selectedDebt.amount,
        formatDateSafely(paycheck.date, "yyyy-MM-dd"),
      );
      setSelectedDebt(null);
    } catch (error) {
      console.error("Failed to assign debt:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCancel = () => {
    setSelectedDebt(null);
  };

  if (debts.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center py-4">
          <CurrencyDollarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No Debts to Assign
          </h3>
          <p className="text-xs text-gray-600">
            All debts have been allocated to paychecks.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step 1: Select Debt */}
      {!selectedDebt && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Step 1: Select a Debt to Assign
          </h3>
          <div className="space-y-2">
            {debts.map((debt) => {
              const isPastDue = new Date(debt.dueDate) < new Date();
              return (
                <button
                  key={debt.id}
                  onClick={() => handleDebtSelect(debt)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                    isPastDue
                      ? "border-red-200 bg-red-50 hover:bg-red-100"
                      : "border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isPastDue ? "bg-red-500" : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-sm font-semibold text-gray-900">
                        {debt.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ${debt.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Due {formatDateSafely(debt.dueDate, "MMM dd")}</span>
                    {isPastDue && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <ExclamationTriangleIcon className="h-3 w-3" />
                        <span>Past Due</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Step 2: Select Paycheck */}
      {selectedDebt && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Step 2: Choose Paycheck
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="p-2"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Selected: {selectedDebt.name}
                  </p>
                  <p className="text-xs text-blue-700">
                    ${selectedDebt.amount.toLocaleString()} • Due{" "}
                    {formatDateSafely(selectedDebt.dueDate, "MMM dd")}
                  </p>
                </div>
                <CheckIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Assign to Paycheck:
            </h4>
            <div className="space-y-2">
              {paychecks.map((paycheck) => (
                <button
                  key={paycheck.id}
                  onClick={() => handlePaycheckSelect(paycheck)}
                  disabled={isAssigning}
                  className="w-full p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-left transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {paycheck.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      ${paycheck.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>
                      {formatDateSafely(paycheck.date, "MMM dd, yyyy")}
                    </span>
                    <span>{paycheck.frequency}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {isAssigning && (
        <Card className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm text-gray-600">Assigning debt...</span>
          </div>
        </Card>
      )}
    </div>
  );
}
