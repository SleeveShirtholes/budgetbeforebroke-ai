"use client";

import { useEffect, useRef, useState } from "react";
import { FilterOperator, FilterValue } from "./types";

import { FunnelIcon } from "@heroicons/react/20/solid";

/**
 * A dropdown filter component for individual table columns.
 *
 * @param {Object} props - The component props
 * @param {string} props.columnKey - Key identifier for the column being filtered
 * @param {string} [props.placeholder] - Optional placeholder text for the filter input
 * @param {FilterValue} [props.currentFilter] - Current filter value and operator
 * @param {(columnKey: string, filter: FilterValue | null) => void} props.onFilterChange - Callback when filter changes
 */

interface ColumnFilterProps {
  columnKey: string;
  placeholder?: string;
  currentFilter?: FilterValue;
  onFilterChange: (columnKey: string, filter: FilterValue | null) => void;
}

export default function ColumnFilter({
  columnKey,
  placeholder = "Filter...",
  currentFilter,
  onFilterChange,
}: ColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(currentFilter?.value || "");
  const [operator, setOperator] = useState<FilterOperator>(
    currentFilter?.operator || "contains",
  );
  const filterRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update local state when props change
  useEffect(() => {
    setValue(currentFilter?.value || "");
    setOperator(currentFilter?.operator || "contains");
  }, [currentFilter]);

  // Close the filter dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Apply the filter
  const applyFilter = () => {
    if (value.trim()) {
      onFilterChange(columnKey, {
        value: value.trim(),
        operator,
      });
    } else {
      clearFilter();
    }
    setIsOpen(false);
  };

  // Clear the filter
  const clearFilter = () => {
    setValue("");
    setOperator("contains");
    onFilterChange(columnKey, null);
  };

  return (
    <div
      className="relative inline-block"
      ref={filterRef}
      style={{ zIndex: isOpen ? 9999 : "auto" }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded-md transition-colors ${
          isOpen
            ? "bg-secondary-100 text-secondary-800"
            : currentFilter
              ? "text-primary-600 hover:bg-secondary-50"
              : "text-gray-400 hover:text-gray-600 hover:bg-secondary-50"
        }`}
        title="Filter column"
      >
        <FunnelIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="rounded-md shadow-lg bg-white border border-gray-200 overflow-hidden"
          style={{
            position: "fixed",
            zIndex: 9999,
            width: "16rem",
            top: filterRef.current
              ? filterRef.current.getBoundingClientRect().bottom + 4
              : 0,
            left: filterRef.current
              ? filterRef.current.getBoundingClientRect().left
              : 0,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <div className="p-3">
            <div className="mb-3">
              <label
                htmlFor={`${columnKey}-operator`}
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Operator
              </label>
              <select
                id={`${columnKey}-operator`}
                value={operator}
                onChange={(e) => setOperator(e.target.value as FilterOperator)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              >
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="startsWith">Starts with</option>
                <option value="endsWith">Ends with</option>
                <option value="greaterThan">Greater than</option>
                <option value="lessThan">Less than</option>
              </select>
            </div>

            <div className="mb-3">
              <label
                htmlFor={`${columnKey}-value`}
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Value
              </label>
              <input
                id={`${columnKey}-value`}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                onKeyDown={(e) => e.key === "Enter" && applyFilter()}
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={clearFilter}
                className="px-2 py-1 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                Clear
              </button>
              <button
                onClick={applyFilter}
                className="px-2 py-1 text-xs bg-primary-600 text-white hover:bg-primary-700 rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
