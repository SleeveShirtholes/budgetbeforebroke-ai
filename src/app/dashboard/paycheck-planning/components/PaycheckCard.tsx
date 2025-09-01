import { useState } from "react";
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { formatDateSafely } from "@/utils/date";
import type {
  PaycheckAllocation,
  PaycheckInfo,
} from "@/app/actions/paycheck-planning";

interface PaycheckCardProps {
  allocation: PaycheckAllocation;
  paycheck?: PaycheckInfo;
  onMarkPaymentAsPaid?: (debtId: string, paymentId: string) => Promise<void>;
  budgetAccountId?: string;
}

export default function PaycheckCard({
  allocation,
  paycheck,
  onMarkPaymentAsPaid,
}: PaycheckCardProps) {
  const [markingAsPaidId, setMarkingAsPaidId] = useState<string | null>(null);
  const hasInsufficientFunds = allocation.remainingAmount < 0;
  const hasRemainingBalance = allocation.remainingAmount > 0;

  const handleMarkAsPaid = async (debtId: string, paymentId: string) => {
    if (onMarkPaymentAsPaid && paymentId) {
      setMarkingAsPaidId(paymentId);
      try {
        await onMarkPaymentAsPaid(debtId, paymentId);
      } finally {
        setMarkingAsPaidId(null);
      }
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        {/* Paycheck Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {paycheck?.name || "Paycheck"}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CalendarDaysIcon className="h-4 w-4" />
                <span>
                  {formatDateSafely(allocation.paycheckDate, "MMM dd, yyyy")}
                </span>
                <span>•</span>
                <span>{paycheck?.frequency || "Unknown"}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              ${allocation.paycheckAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Allocated Debts */}
        {allocation.allocatedDebts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Allocated Payments
            </h4>
            <div className="space-y-2">
              {allocation.allocatedDebts.map((debt) => (
                <div
                  key={debt.debtId}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                >
                  {/* Simple Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          debt.isPaid ? "bg-green-500" : "bg-secondary-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {debt.debtName}
                      </span>
                    </div>
                  </div>

                  {/* Simple Details */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      Due {formatDateSafely(debt.dueDate, "MMM dd")}
                    </span>

                    {debt.isPaid ? (
                      <span className="text-xs text-green-600 font-medium">
                        Paid{" "}
                        {formatDateSafely(debt.paymentDate || "", "MMM dd")}
                      </span>
                    ) : (
                      <span className="text-xs text-secondary-600">
                        Scheduled
                      </span>
                    )}
                  </div>

                  {/* Amount Information */}
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-gray-500">
                      Due:{" "}
                      <span className="font-medium text-gray-900">
                        $
                        {(debt.amount && !isNaN(debt.amount)
                          ? debt.amount
                          : 0
                        ).toLocaleString()}
                      </span>
                    </span>

                    {debt.paymentAmount &&
                      !isNaN(debt.paymentAmount) &&
                      debt.amount &&
                      !isNaN(debt.amount) &&
                      debt.paymentAmount !== debt.amount && (
                        <span className="text-secondary-600">
                          Paying:{" "}
                          <span className="font-medium text-secondary-900">
                            ${debt.paymentAmount.toLocaleString()}
                          </span>
                        </span>
                      )}
                  </div>

                  {/* Simple Actions */}
                  <div className="flex items-center justify-end space-x-2">
                    {!debt.isPaid && debt.paymentId && onMarkPaymentAsPaid && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleMarkAsPaid(debt.debtId, debt.paymentId!)
                          }
                          disabled={markingAsPaidId === debt.paymentId}
                          className="text-xs px-2 py-1 h-7"
                        >
                          {markingAsPaidId === debt.paymentId ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Mark Paid"
                          )}
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={async () => {
                            // Handle removal logic here
                          }}
                          className="text-xs px-2 py-1 h-7"
                          title="Remove allocation"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </Button>
                      </>
                    )}

                    {debt.isPaid && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={async () => {
                          // Handle removal logic here
                        }}
                        className="text-xs px-2 py-1 h-7"
                        title="Remove allocation"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remaining Balance */}
        <div
          className={`flex items-center justify-between p-4 rounded-lg ${
            hasInsufficientFunds
              ? "bg-red-50 border border-red-200"
              : hasRemainingBalance
                ? "bg-green-50 border border-green-200"
                : "bg-secondary-50 border border-secondary-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {hasInsufficientFunds ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            )}
            <span
              className={`text-sm font-medium ${
                hasInsufficientFunds
                  ? "text-red-900"
                  : hasRemainingBalance
                    ? "text-green-900"
                    : "text-secondary-900"
              }`}
            >
              {hasInsufficientFunds
                ? "Insufficient Funds"
                : hasRemainingBalance
                  ? "Remaining Balance"
                  : "Fully Allocated"}
            </span>
          </div>
          <span
            className={`text-lg font-bold ${
              hasInsufficientFunds
                ? "text-red-600"
                : hasRemainingBalance
                  ? "text-green-600"
                  : "text-gray-900"
            }`}
          >
            {hasInsufficientFunds ? "-" : ""}$
            {Math.abs(allocation.remainingAmount).toLocaleString()}
          </span>
        </div>

        {/* Summary */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <div className="flex justify-between">
            <span>
              Allocated to {allocation.allocatedDebts.length} payment
              {allocation.allocatedDebts.length !== 1 ? "s" : ""}
            </span>
            <span>
              $
              {allocation.allocatedDebts
                .reduce(
                  (sum, debt) =>
                    sum +
                    (debt.paymentAmount && !isNaN(debt.paymentAmount)
                      ? debt.paymentAmount
                      : debt.amount),
                  0,
                )
                .toLocaleString()}{" "}
              total
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
