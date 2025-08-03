"use client";

import { ReactNode } from "react";
import { ColumnDef } from "./types";
import { format } from "date-fns";

interface MobileTransactionListProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: (row: T) => {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  }[];
}

/**
 * Mobile-friendly transaction list that displays data as cards instead of a table
 * This component is designed for mobile devices where horizontal scrolling is problematic
 */
export default function MobileTransactionList<
  T extends Record<string, unknown>,
>({ data, columns, actions }: MobileTransactionListProps<T>) {
  const getColumnValue = (row: T, key: string, fallback: string): ReactNode => {
    const column = columns.find((col) => col.key === key);
    if (column?.accessor) {
      const result = column.accessor(row);
      if (
        result &&
        (typeof result === "string" || typeof result === "number")
      ) {
        return String(result);
      }
      if (result && typeof result === "object" && "props" in result) {
        return result as ReactNode;
      }
    }
    const rowValue = (row as Record<string, unknown>)[key];
    return rowValue != null ? String(rowValue) : fallback;
  };
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((row, index) => {
        const rowId =
          "id" in row && row.id !== undefined
            ? String(row.id)
            : index.toString();

        return (
          <div
            key={rowId}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            {/* Main transaction info */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {/* Date and Merchant */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {(() => {
                      const dateColumn = columns.find(
                        (col) => col.key === "date",
                      );
                      if (dateColumn?.accessor) {
                        const result = dateColumn.accessor(row);
                        if (
                          result &&
                          (typeof result === "string" ||
                            typeof result === "number")
                        ) {
                          return format(
                            new Date(String(result)),
                            "MMM d, yyyy",
                          );
                        }
                      }
                      return row.date
                        ? format(new Date(row.date as string), "MMM d, yyyy")
                        : "No date";
                    })()}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-700">
                    {row.merchantName && typeof row.merchantName === "string"
                      ? row.merchantName
                      : "Unknown merchant"}
                  </span>
                </div>

                {/* Amount */}
                <div className="mb-2">
                  {(() => {
                    const amountColumn = columns.find(
                      (col) => col.key === "amount",
                    );
                    if (amountColumn?.accessor) {
                      const result = amountColumn.accessor(row);
                      if (
                        result &&
                        (typeof result === "string" ||
                          typeof result === "number")
                      ) {
                        const amount = Number(result);
                        return (
                          <span
                            className={`text-lg font-semibold ${
                              row.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {row.type === "income" ? "+" : "-"}$
                            {amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        );
                      }
                    }
                    return row.amount ? (
                      <span
                        className={`text-lg font-semibold ${
                          row.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {row.type === "income" ? "+" : "-"}$
                        {Number(row.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    ) : (
                      "No amount"
                    );
                  })()}
                </div>
              </div>

              {/* Actions */}
              {actions && (
                <div className="flex gap-1 ml-2">
                  {actions(row).map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={action.onClick}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                      title={action.label}
                    >
                      {action.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Category:</span>
                <div className="text-sm">
                  {getColumnValue(row, "categoryName", "No category")}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
