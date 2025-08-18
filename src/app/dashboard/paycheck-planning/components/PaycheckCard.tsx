import { useState } from "react";
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
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
                  className={`flex items-center justify-between p-3 rounded-lg relative bg-gray-50`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        debt.isPaid ? "bg-green-500" : "bg-blue-500"
                      }`}
                    ></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {debt.debtName}
                      </span>
                      <div className="flex flex-col space-y-1 text-xs text-gray-500">
                        <span
                          className={`${
                            !debt.isPaid &&
                            debt.dueDate <
                              new Date().toISOString().split("T")[0]
                              ? "text-red-600 font-medium"
                              : ""
                          }`}
                        >
                          Due {formatDateSafely(debt.dueDate, "MMM dd")}
                          {!debt.isPaid &&
                            debt.dueDate <
                              new Date().toISOString().split("T")[0] && (
                              <span className="text-red-600 ml-1">
                                ⚠️ Past Due
                              </span>
                            )}
                        </span>
                        {debt.isPaid && debt.paymentDate && (
                          <span className="text-green-600 font-medium">
                            Paid {formatDateSafely(debt.paymentDate, "MMM dd")}
                            {debt.paymentDate > debt.dueDate && (
                              <span className="text-red-600 ml-1">(Late)</span>
                            )}
                          </span>
                        )}
                        {!debt.isPaid && debt.paymentDate && (
                          <span
                            className={`text-xs ${
                              debt.paymentDate > debt.dueDate
                                ? "text-red-600 font-medium"
                                : "text-blue-600"
                            }`}
                          >
                            Pay {formatDateSafely(debt.paymentDate, "MMM dd")}
                            {debt.paymentDate > debt.dueDate && " (Late)"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mark as Paid Button - positioned between dates and amount */}
                  {!debt.isPaid && debt.paymentId && onMarkPaymentAsPaid && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleMarkAsPaid(debt.debtId, debt.paymentId!)
                      }
                      disabled={markingAsPaidId === debt.paymentId}
                      className="text-xs px-2 py-1 h-7 text-green-700 border-green-300 hover:bg-green-50"
                    >
                      {markingAsPaidId === debt.paymentId ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Mark Paid"
                      )}
                    </Button>
                  )}

                  {/* Paid Indicator - show when debt is paid */}
                  {debt.isPaid && (
                    <div className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border-2 border-dashed border-green-300 rounded-md">
                      Paid
                    </div>
                  )}

                  <span className="text-sm font-semibold text-gray-900">
                    ${debt.amount.toLocaleString()}
                  </span>
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
                : "bg-blue-50 border border-blue-200"
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
                    : "text-blue-900"
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
                .reduce((sum, debt) => sum + debt.amount, 0)
                .toLocaleString()}{" "}
              total
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
