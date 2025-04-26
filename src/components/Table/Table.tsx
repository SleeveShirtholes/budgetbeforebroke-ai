"use client";

import { ReactNode, useState } from "react";
import { ColumnDef, FilterValue, FiltersState, SortingState } from "./types";

import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import TablePagination from "./TablePagination";
import TableSearch from "./TableSearch";

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
}: TableProps<T>) {
    // State for sorting
    const [sorting, setSorting] = useState<SortingState>({
        column: "",
        direction: "asc",
    });

    // State for search
    const [searchQuery, setSearchQuery] = useState("");

    // State for column filters
    const [filters, setFilters] = useState<FiltersState>({});

    // Internal pagination visibility state
    const [internalShowPagination, setInternalShowPagination] = useState(initialShowPagination);

    // Determine whether to use the controlled or uncontrolled pagination state
    const showPagination = onPaginationChange !== undefined ? initialShowPagination : internalShowPagination;

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);

    // State for expanded rows
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

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

    // Handle column filter changes
    const handleFilterChange = (columnKey: string, filter: FilterValue | null) => {
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
                return !isNaN(Number(value)) && !isNaN(Number(filterValue)) && Number(value) > Number(filterValue);
            case "lessThan":
                return !isNaN(Number(value)) && !isNaN(Number(filterValue)) && Number(value) < Number(filterValue);
            default:
                return stringValue.includes(filterValue);
        }
    };

    // Filter data based on search query and column filters
    const filteredData = data.filter((row) => {
        // Apply search query filter
        if (searchQuery) {
            const matchesSearch = columns.some((column) => {
                const value = row[column.key];
                if (value === null || value === undefined) return false;

                const stringValue = value.toString().toLowerCase();
                const searchTerm = searchQuery.toLowerCase();

                // For name columns, match exact words
                if (typeof value === "string") {
                    const regex = new RegExp(`\\b${searchTerm}\\b`, "i");
                    return regex.test(stringValue);
                }
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
        if (aValue === null || aValue === undefined) return sorting.direction === "asc" ? -1 : 1;
        if (bValue === null || bValue === undefined) return sorting.direction === "asc" ? 1 : -1;

        // Compare based on value type
        if (typeof aValue === "string") {
            return sorting.direction === "asc"
                ? aValue.localeCompare(bValue as string)
                : (bValue as string).localeCompare(aValue as string);
        } else {
            return sorting.direction === "asc" ? (aValue > bValue ? 1 : -1) : aValue > bValue ? -1 : 1;
        }
    });

    // Calculate pagination or use all data if pagination is disabled
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const displayData = showPagination
        ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
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
            <div className="flex justify-between items-center mb-4">
                <div className="w-full sm:w-64">
                    <TableSearch value={searchQuery} onChange={handleSearchChange} />
                </div>
                <div className="flex items-center space-x-2">
                    {/* Clear sorting button */}
                    <button
                        onClick={clearAllSorting}
                        className={`p-1.5 rounded-md transition-colors relative ${
                            isSortingActive ? "text-primary-600 hover:bg-primary-50" : "text-gray-400 hover:bg-gray-100"
                        }`}
                        title="Clear sorting"
                        disabled={!isSortingActive}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                            {isSortingActive && <circle cx="18" cy="6" r="4" fill="currentColor" />}
                        </svg>
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={showPagination ? "M4 6h16M4 10h16M4 14h16M4 18h16" : "M4 6h16M4 12h8m-8 6h16"}
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Active filters display */}
            {activeFiltersCount > 0 && (
                <div className="flex items-center mb-2 text-sm">
                    <span className="text-gray-700 mr-2">Active filters:</span>
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
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
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

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
                    <TableHeader<T>
                        columns={columns}
                        sorting={sorting}
                        onSort={setSorting}
                        actions={!!actions}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                    <TableBody<T>
                        data={displayData}
                        columns={columns}
                        expandedRows={expandedRows}
                        toggleRowExpansion={toggleRowExpansion}
                        detailPanel={detailPanel}
                        actions={actions}
                    />
                </table>
            </div>

            {showPagination && totalPages > 1 && (
                <div className="mt-4">
                    <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    );
}
