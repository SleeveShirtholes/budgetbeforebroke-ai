"use client";

import {
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/20/solid";
import { ColumnDef, FilterValue, FiltersState, SortingState } from "./types";

import ColumnFilter from "./ColumnFilter";

/**
 * Renders the header row of the table with support for sorting and filtering.
 *
 * @template T - The type of data being displayed in the table
 * @param {Object} props - The component props
 * @param {ColumnDef<T>[]} props.columns - Column definitions for the table
 * @param {SortingState} props.sorting - Current sorting state
 * @param {FiltersState} props.filters - Current filter state for all columns
 * @param {(sorting: SortingState) => void} props.onSort - Callback when sorting changes
 * @param {(columnKey: string, filter: FilterValue | null) => void} props.onFilterChange - Callback when a column filter changes
 * @param {boolean} props.actions - Whether to show the actions column
 * @param {boolean} props.hasDetailPanel - Whether the table has a detail panel (controls expansion column visibility)
 */

interface TableHeaderProps<T> {
  columns: ColumnDef<T>[];
  sorting: SortingState;
  filters: FiltersState;
  onSort: (sorting: SortingState) => void;
  onFilterChange: (columnKey: string, filter: FilterValue | null) => void;
  actions: boolean;
  hasDetailPanel: boolean;
}

export default function TableHeader<T>({
  columns,
  sorting,
  filters,
  onSort,
  onFilterChange,
  actions,
  hasDetailPanel,
}: TableHeaderProps<T>) {
  const handleSort = (column: ColumnDef<T>) => {
    if (!column.sortable) return;

    if (sorting.column === column.key) {
      // If already sorting by this column, toggle between asc, desc, and off
      if (sorting.direction === "asc") {
        onSort({
          column: column.key,
          direction: "desc",
        });
      } else {
        // If desc, turn off sorting
        onSort({
          column: "",
          direction: "asc",
        });
      }
    } else {
      // Start with ascending sort for new column
      onSort({
        column: column.key,
        direction: "asc",
      });
    }
  };

  return (
    <thead className="bg-secondary-50">
      <tr>
        {/* Expansion column - only show if detailPanel is provided */}
        {hasDetailPanel && <th className="w-10 px-4 py-3 text-left" />}

        {/* Data columns */}
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-4 py-3 text-left text-sm font-medium text-secondary-700 ${
              column.width ? column.width : ""
            }`}
          >
            <div className="flex items-center space-x-2">
              {/* Column filter button (now on the left) */}
              {column.filterable && (
                <ColumnFilter
                  columnKey={column.key}
                  placeholder={column.filterPlaceholder}
                  currentFilter={filters[column.key]}
                  onFilterChange={onFilterChange}
                />
              )}

              {/* Column header and sort control */}
              <div
                className={`flex-grow flex items-center ${column.sortable ? "cursor-pointer" : ""}`}
                onClick={() => column.sortable && handleSort(column)}
              >
                <span>{column.header}</span>
                {column.sortable && (
                  <div className="ml-1">
                    {sorting.column === column.key ? (
                      sorting.direction === "asc" ? (
                        <ChevronUpIcon
                          className="w-5 h-5 ml-1 text-gray-600"
                          title="Sort ascending"
                        />
                      ) : (
                        <ChevronDownIcon
                          className="w-5 h-5 ml-1 text-gray-600"
                          title="Sort descending"
                        />
                      )
                    ) : (
                      <ChevronUpDownIcon
                        className="w-5 h-5 ml-1 text-gray-600"
                        title="Click to sort"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </th>
        ))}

        {/* Actions column */}
        {actions && (
          <th className="w-20 px-4 py-3 text-left text-sm font-medium text-secondary-700">
            Actions
          </th>
        )}
      </tr>
    </thead>
  );
}
