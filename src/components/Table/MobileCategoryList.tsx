"use client";

import { ReactNode } from "react";
import { ColumnDef } from "./types";

interface MobileCategoryListProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: (row: T) => {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  }[];
}

/**
 * Mobile-friendly category list that displays data as cards instead of a table
 * This component is designed for mobile devices where horizontal scrolling is problematic
 */
export default function MobileCategoryList<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
}: MobileCategoryListProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No categories found</div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((row, index) => {
        const rowId =
          "id" in row && row.id !== undefined
            ? String(row.id)
            : index.toString();

        return (
          <div
            key={rowId}
            className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
          >
            {/* Main category info */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {/* Category name */}
                <div className="mb-1">
                  <span className="text-base font-semibold text-gray-900 truncate">
                    {columns.find((col) => col.key === "name")?.accessor
                      ? columns.find((col) => col.key === "name")?.accessor!(
                          row,
                        )
                      : (row.name as string) || "No name"}
                  </span>
                </div>

                {/* Description - only show if it exists */}
                {(columns.find((col) => col.key === "description")?.accessor
                  ? columns.find((col) => col.key === "description")?.accessor!(
                      row,
                    )
                  : (row.description as string)) && (
                  <div className="mb-1">
                    <span className="text-xs text-gray-600 truncate">
                      {columns.find((col) => col.key === "description")
                        ?.accessor
                        ? columns.find((col) => col.key === "description")
                            ?.accessor!(row)
                        : (row.description as string) || ""}
                    </span>
                  </div>
                )}

                {/* Transaction count */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Transactions:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {(row.transactionCount as string) || "0"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {actions && (
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  {actions(row).map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={action.onClick}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                      title={action.label}
                    >
                      {action.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
