"use client";

import { DebtPayment } from "@/types/debt";
import { format } from "date-fns";

interface MobilePaymentHistoryProps {
  payments: DebtPayment[];
}

/**
 * Mobile-friendly payment history that displays payments as cards instead of a table
 * This component is designed for mobile devices where horizontal scrolling is problematic
 */
export default function MobilePaymentHistory({
  payments,
}: MobilePaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <div className="text-sm">No payments yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {payments.map((payment, index) => (
        <div
          key={payment.id || index}
          className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          {/* Date and day */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="text-xs text-gray-500">
              {format(new Date(payment.date), "EEEE")}
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {format(new Date(payment.date), "MMM d, yyyy")}
            </div>
          </div>

          {/* Amount */}
          <div className="flex-shrink-0 ml-4">
            <div className="text-lg font-bold text-green-600">
              $
              {payment.amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
