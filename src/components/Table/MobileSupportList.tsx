"use client";

import { ReactNode, useState } from "react";
import { ColumnDef } from "./types";
import { format } from "date-fns";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface MobileSupportListProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: (row: T) => {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  }[];
  detailPanel?: (row: T) => ReactNode;
}

/**
 * Mobile-friendly support list that displays data as cards instead of a table
 * This component is designed for mobile devices where horizontal scrolling is problematic
 */
export default function MobileSupportList<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  detailPanel,
}: MobileSupportListProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No issues found</div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((row, index) => {
        const rowId =
          "id" in row && row.id !== undefined
            ? String(row.id)
            : index.toString();
        const isExpanded = expandedRows.has(rowId);

        return (
          <div
            key={rowId}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Main support request info */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <div className="mb-2">
                    <span className="text-base font-semibold text-gray-900 truncate">
                      {getColumnValue(row, "title", "No title")}
                    </span>
                  </div>

                  {/* Category and Status */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">
                      {getColumnValue(row, "category", "No category")}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs">
                      {getColumnValue(row, "status", "No status")}
                    </span>
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-gray-500">
                    {(() => {
                      const lastUpdatedColumn = columns.find(
                        (col) => col.key === "lastUpdated",
                      );
                      if (lastUpdatedColumn?.accessor) {
                        const result = lastUpdatedColumn.accessor(row);
                        if (result != null) {
                          return format(
                            new Date(String(result)),
                            "MMM d, yyyy h:mm a",
                          );
                        }
                      }
                      return row.lastUpdated
                        ? format(
                            new Date(row.lastUpdated as string),
                            "MMM d, yyyy h:mm a",
                          )
                        : "No date";
                    })()}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  {/* Actions */}
                  {actions && (
                    <div className="flex gap-1">
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

                  {/* Expand/Collapse button */}
                  {detailPanel && (
                    <button
                      onClick={() => toggleRowExpansion(rowId)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                      title={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? (
                        <ChevronDownIcon className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Upvotes/Downvotes */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Upvotes:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {getColumnValue(row, "upvotes", "0")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            {detailPanel && isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                {detailPanel(row)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
