import { format } from "date-fns";
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Card from "@/components/Card";
import type {
  PaycheckAllocation,
  PaycheckInfo,
} from "@/app/actions/paycheck-planning";

interface PaycheckCardProps {
  allocation: PaycheckAllocation;
  paycheck?: PaycheckInfo;
}

export default function PaycheckCard({
  allocation,
  paycheck,
}: PaycheckCardProps) {
  const hasInsufficientFunds = allocation.remainingAmount < 0;
  const hasRemainingBalance = allocation.remainingAmount > 0;

  return (
    <Card
      className={`border-l-4 ${
        hasInsufficientFunds
          ? "border-l-red-500"
          : hasRemainingBalance
            ? "border-l-green-500"
            : "border-l-blue-500"
      }`}
    >
      <div className="space-y-4">
        {/* Paycheck Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                hasInsufficientFunds
                  ? "bg-red-100"
                  : hasRemainingBalance
                    ? "bg-green-100"
                    : "bg-blue-100"
              }`}
            >
              <CurrencyDollarIcon
                className={`h-5 w-5 ${
                  hasInsufficientFunds
                    ? "text-red-600"
                    : hasRemainingBalance
                      ? "text-green-600"
                      : "text-blue-600"
                }`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {paycheck?.name || "Paycheck"}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CalendarDaysIcon className="h-4 w-4" />
                <span>{format(allocation.paycheckDate, "MMM dd, yyyy")}</span>
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
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {debt.debtName}
                    </span>
                    <span className="text-xs text-gray-500">
                      Due {format(debt.dueDate, "MMM dd")}
                    </span>
                  </div>
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
                ? "text-red-900"
                : hasRemainingBalance
                  ? "text-green-900"
                  : "text-blue-900"
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
