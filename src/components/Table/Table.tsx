"use client";

import {
  Bars3Icon,
  ChevronUpDownIcon,
  FunnelIcon,
} from "@heroicons/react/20/solid";
import { ReactNode, useState } from "react";
import { ColumnDef, FilterValue, FiltersState, SortingState } from "./types";
import { useDebounce } from "@/hooks/useDebounce";

import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import TablePagination from "./TablePagination";
import TableSearch from "./TableSearch";
import MobileTransactionList from "./MobileTransactionList";
import MobileCategoryList from "./MobileCategoryList";
import MobileSupportList from "./MobileSupportList";

/**
 * A flexible and feature-rich table component that supports sorting, filtering, pagination,
 * expandable rows, and row actions.
 *
 * @template T - The type of data being displayed in the table. Must extend Record<string, unknown>
 * @param {Object} props - The component props
 * @param {T[]} props.data - Array of data items to display in the table
 * @param {ColumnDef<T>[]} props.columns - Column definitions specifying how to display and interact with data
 * @param {(row: T) => ReactNode} [props.detailPanel] - Optional function to render expanded row details
 * @param {(row: T) => Array<{label: string, icon?: ReactNode, onClick: () => void}>} [props.actions] - Optional function to generate row actions
 * @param {string} [props.className] - Optional CSS class name for styling
 * @param {number} [props.pageSize=10] - Number of rows per page when pagination is enabled
 * @param {boolean} [props.showPagination=true] - Whether to show pagination controls
 * @param {(showPagination: boolean) => void} [props.onPaginationChange] - Callback when pagination visibility changes
 */

export interface TableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  detailPanel?: (row: T) => ReactNode;
  actions?: (row: T) => {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  }[];
  className?: string;
  pageSize?: number;
  showPagination?: boolean;
  onPaginationChange?: (showPagination: boolean) => void;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selectedRows: Set<string>) => void;
  getRowId?: (row: T, index: number) => string;
  showMobileView?: boolean;
}

export default function Table<T extends Record<string, unknown>>({
  data,
  columns,
  detailPanel,
  actions,
  className = "",
  pageSize = 10,
  showPagination: initialShowPagination = true,
  onPaginationChange,
  selectable = false,
  selectedRows: externalSelectedRows,
  onSelectionChange,
  getRowId,
  showMobileView = true,
}: TableProps<T>) {
  // State for sorting
  const [sorting, setSorting] = useState<SortingState>({
    column: "",
    direction: "asc",
  });

  // State for search
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search query to improve performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // State for column filters
  const [filters, setFilters] = useState<FiltersState>({});

  // Internal pagination visibility state
  const [internalShowPagination, setInternalShowPagination] = useState(
    initialShowPagination,
  );

  // Determine whether to use the controlled or uncontrolled pagination state
  const showPagination =
    onPaginationChange !== undefined
      ? initialShowPagination
      : internalShowPagination;

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // State for row selection
  const [internalSelectedRows, setInternalSelectedRows] = useState<Set<string>>(
    new Set(),
  );

  // Use external or internal selection state
  const selectedRows =
    externalSelectedRows !== undefined
      ? externalSelectedRows
      : internalSelectedRows;

  // Get row ID function - default to using the index if no custom function provided
  const getRowIdFn = getRowId || ((row: T, index: number) => `row-${index}`);

  // Handle toggling pagination
  const togglePagination = () => {
    const newValue = !showPagination;
    if (onPaginationChange) {
      onPaginationChange(newValue);
    } else {
      setInternalShowPagination(newValue);
    }
    // Reset to first page when enabling pagination
    if (newValue && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Handle row selection
  const handleRowSelection = (rowId: string, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(rowId);
    } else {
      newSelectedRows.delete(rowId);
    }

    if (onSelectionChange) {
      onSelectionChange(newSelectedRows);
    } else {
      setInternalSelectedRows(newSelectedRows);
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows = new Set<string>();
    if (checked) {
      data.forEach((row, index) => {
        newSelectedRows.add(getRowIdFn(row, index));
      });
    }

    if (onSelectionChange) {
      onSelectionChange(newSelectedRows);
    } else {
      setInternalSelectedRows(newSelectedRows);
    }
  };

  // Handle column filter changes
  const handleFilterChange = (
    columnKey: string,
    filter: FilterValue | null,
  ) => {
    setFilters((prevFilters: FiltersState) => {
      const newFilters = { ...prevFilters };
      if (filter) {
        newFilters[columnKey] = filter;
      } else {
        delete newFilters[columnKey];
      }
      return newFilters;
    });
    // Reset to first page
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Clear all sorting
  const clearAllSorting = () => {
    setSorting({ column: "", direction: "asc" });
  };

  // Apply column filters to data
  const applyFilterToValue = (value: unknown, filter: FilterValue): boolean => {
    if (value === null || value === undefined) return false;

    const stringValue = String(value).toLowerCase();
    const filterValue = filter.value.toLowerCase();

    switch (filter.operator) {
      case "contains":
        // For name columns, match exact words
        if (typeof value === "string") {
          const regex = new RegExp(`\\b${filterValue}\\b`, "i");
          return regex.test(stringValue);
        }
        return stringValue.includes(filterValue);
      case "equals":
        return stringValue === filterValue;
      case "startsWith":
        return stringValue.startsWith(filterValue);
      case "endsWith":
        return stringValue.endsWith(filterValue);
      case "greaterThan":
        return (
          !isNaN(Number(value)) &&
          !isNaN(Number(filterValue)) &&
          Number(value) > Number(filterValue)
        );
      case "lessThan":
        return (
          !isNaN(Number(value)) &&
          !isNaN(Number(filterValue)) &&
          Number(value) < Number(filterValue)
        );
      default:
        return stringValue.includes(filterValue);
    }
  };

  // Filter data based on search query and column filters
  const filteredData = data.filter((row) => {
    // Apply search query filter
    if (debouncedSearchQuery) {
      const matchesSearch = columns.some((column) => {
        const value = row[column.key];
        if (value === null || value === undefined) return false;

        const stringValue = value.toString().toLowerCase();
        const searchTerm = debouncedSearchQuery.toLowerCase();

        return stringValue.includes(searchTerm);
      });
      if (!matchesSearch) return false;
    }

    // Apply column filters
    for (const [columnKey, filterValue] of Object.entries(filters)) {
      const value = row[columnKey];
      if (!applyFilterToValue(value, filterValue as FilterValue)) {
        return false;
      }
    }

    return true;
  });

  // Sort data based on current sorting state
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sorting.column) return 0;

    const aValue = a[sorting.column];
    const bValue = b[sorting.column];

    if (aValue === bValue) return 0;

    // Handle null or undefined values
    if (aValue === null || aValue === undefined)
      return sorting.direction === "asc" ? -1 : 1;
    if (bValue === null || bValue === undefined)
      return sorting.direction === "asc" ? 1 : -1;

    // Compare based on value type
    if (typeof aValue === "string") {
      return sorting.direction === "asc"
        ? aValue.localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue as string);
    } else {
      return sorting.direction === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue > bValue
          ? -1
          : 1;
    }
  });

  // Calculate pagination or use all data if pagination is disabled
  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Virtualization threshold - only show limited rows for very large datasets
  const VIRTUALIZATION_THRESHOLD = 1000;
  const shouldVirtualize = sortedData.length > VIRTUALIZATION_THRESHOLD;

  // For very large datasets, limit the display to improve performance
  const effectivePageSize = shouldVirtualize
    ? Math.min(pageSize, 50)
    : pageSize;
  const effectiveTotalPages = shouldVirtualize
    ? Math.ceil(sortedData.length / effectivePageSize)
    : totalPages;

  const displayData = showPagination
    ? sortedData.slice(
        (currentPage - 1) * effectivePageSize,
        currentPage * effectivePageSize,
      )
    : shouldVirtualize
      ? sortedData.slice(0, 100) // Limit to 100 rows for very large datasets when pagination is disabled
      : sortedData;

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Reset to first page when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Count active filters
  const activeFiltersCount = Object.keys(filters).length;

  // Check if sorting is active
  const isSortingActive = sorting.column !== "";

  return (
    <div className="flex flex-col w-full">
      {/* Header controls - responsive layout */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
        <div className="w-full lg:w-64">
          <TableSearch value={searchQuery} onChange={handleSearchChange} />
        </div>
        <div className="flex items-center justify-end space-x-2">
          {/* Clear sorting button */}
          <button
            onClick={clearAllSorting}
            className={`p-1.5 rounded-md transition-colors relative ${
              isSortingActive
                ? "text-primary-600 hover:bg-primary-50"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            title="Clear sorting"
            disabled={!isSortingActive}
          >
            <ChevronUpDownIcon className="w-3 h-3" />
            {isSortingActive && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                1
              </span>
            )}
          </button>

          {/* Pagination toggle */}
          <button
            onClick={togglePagination}
            className="p-1.5 rounded-md hover:bg-secondary-50 transition-colors text-gray-500 hover:text-secondary-700"
            title={showPagination ? "Show all rows" : "Enable pagination"}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center mb-2 text-sm gap-2">
          <span className="text-gray-700 flex-shrink-0">Active filters:</span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(filters).map(([columnKey, filterValue]) => {
              const column = columns.find((col) => col.key === columnKey);
              const typedFilterValue = filterValue as FilterValue;
              return (
                <div
                  key={columnKey}
                  className="inline-flex items-center bg-secondary-100 text-secondary-800 rounded-full px-2 py-1 text-xs"
                >
                  <span className="font-medium mr-1">{column?.header}:</span>
                  <span className="mr-1">{typedFilterValue.operator}</span>
                  <span>&ldquo;{typedFilterValue.value}&rdquo;</span>
                  <button
                    onClick={() => handleFilterChange(columnKey, null)}
                    className="ml-1 text-secondary-600 hover:text-secondary-900"
                  >
                    <FunnelIcon className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary-600 hover:text-primary-700 ml-2"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Mobile-friendly card layout for small screens */}
      {showMobileView && (
        <div className="lg:hidden">
          {/* Check if this is category data by looking for category-specific columns */}
          {columns.some(
            (col) =>
              col.key === "name" &&
              columns.some((c) => c.key === "transactionCount"),
          ) ? (
            <MobileCategoryList<T>
              data={displayData}
              columns={columns}
              actions={actions}
            />
          ) : columns.some(
              (col) =>
                col.key === "title" && columns.some((c) => c.key === "upvotes"),
            ) ? (
            <MobileSupportList<T>
              data={displayData}
              columns={columns}
              actions={actions}
              detailPanel={detailPanel}
            />
          ) : (
            <MobileTransactionList<T>
              data={displayData}
              columns={columns}
              actions={actions}
            />
          )}
        </div>
      )}

      {/* Desktop table layout */}
      <div className="hidden lg:block rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table
            className={`w-full divide-y divide-gray-200 table-fixed ${className}`}
          >
            <TableHeader<T>
              columns={columns}
              sorting={sorting}
              onSort={setSorting}
              actions={!!actions}
              filters={filters}
              onFilterChange={handleFilterChange}
              hasDetailPanel={!!detailPanel}
              selectable={selectable}
              selectedRows={selectedRows}
              onSelectAll={handleSelectAll}
              data={displayData}
            />
            <TableBody<T>
              data={displayData}
              columns={columns}
              expandedRows={expandedRows}
              toggleRowExpansion={toggleRowExpansion}
              detailPanel={detailPanel}
              actions={actions}
              searchQuery={debouncedSearchQuery}
              selectable={selectable}
              selectedRows={selectedRows}
              onRowSelection={handleRowSelection}
              getRowId={getRowIdFn}
            />
          </table>
        </div>
      </div>

      {/* Footer with responsive layout */}
      <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div className="text-sm text-gray-600 text-center lg:text-left">
          Showing {displayData.length} of {sortedData.length} rows
          {shouldVirtualize && (
            <span className="ml-2 text-amber-600 font-medium">
              (Large dataset - performance optimized)
            </span>
          )}
        </div>

        {showPagination && effectiveTotalPages > 1 && (
          <div className="flex justify-center lg:justify-end">
            <TablePagination
              currentPage={currentPage}
              totalPages={effectiveTotalPages}
              onPageChange={setCurrentPage}
              showPagination={showPagination}
              togglePagination={togglePagination}
            />
          </div>
        )}
      </div>
    </div>
  );
}
