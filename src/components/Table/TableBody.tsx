"use client";

import { Fragment, ReactNode, useState } from "react";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ColumnDef } from "./types";
import HighlightedText from "./HighlightedText";
import RowActions from "./RowActions";

/**
 * Renders the body of the table including data rows, expandable detail panels, and row actions.
 *
 * @template T - The type of data being displayed in the table
 * @param {Object} props - The component props
 * @param {T[]} props.data - Array of data items to display in the table
 * @param {ColumnDef<T>[]} props.columns - Column definitions for the table
 * @param {Record<string, boolean>} props.expandedRows - Map of row IDs to their expansion state
 * @param {(id: string) => void} props.toggleRowExpansion - Function to toggle row expansion
 * @param {(row: T) => ReactNode} [props.detailPanel] - Optional function to render expanded row details
 * @param {(row: T) => Array<{label: string, icon?: ReactNode, onClick: () => void}>} [props.actions] - Optional function to generate row actions
 * @param {string} props.searchQuery - The current search query
 */

interface TableBodyProps<T extends Record<string, unknown>> {
    data: T[];
    columns: ColumnDef<T>[];
    expandedRows: Record<string, boolean>;
    toggleRowExpansion: (id: string) => void;
    detailPanel?: (row: T) => ReactNode;
    actions?: (row: T) => {
        label: string;
        icon?: ReactNode;
        onClick: () => void;
    }[];
    searchQuery: string;
}

export default function TableBody<T extends Record<string, unknown>>({
    data,
    columns,
    expandedRows,
    toggleRowExpansion,
    detailPanel,
    actions,
    searchQuery,
}: TableBodyProps<T>) {
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

    // Get a unique ID from a row
    const getRowId = (row: T): string => {
        if ("id" in row && row.id !== undefined) return String(row.id);
        // If no id field, stringify the object as a fallback
        return JSON.stringify(row);
    };

    /**
     * Handles the click event on a table row.
     * Toggles the detail panel if the click is not on an interactive element.
     * @param {React.MouseEvent<HTMLTableRowElement, MouseEvent>} event - The click event.
     * @param {string} rowId - The ID of the row that was clicked.
     */
    const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>, rowId: string) => {
        if (!detailPanel) return;

        let targetElement = event.target as HTMLElement;
        const interactiveTags = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA", "LABEL"];

        // Traverse up the DOM tree from the clicked element up to the row itself (event.currentTarget)
        while (targetElement && targetElement !== event.currentTarget) {
            if (
                interactiveTags.includes(targetElement.tagName) ||
                targetElement.getAttribute("role") === "button" ||
                targetElement.dataset.interactive === "true" || // Explicitly marked interactive via data attribute
                (typeof targetElement.hasAttribute === "function" && targetElement.hasAttribute("onclick")) // Check for inline onclick handlers
            ) {
                // If any parent up to the row is interactive, do not toggle.
                return;
            }
            // A more specific check for elements that look clickable but might not be standard interactive tags
            if (targetElement.classList.contains("cursor-pointer")) {
                // If it has cursor-pointer and it's not the row itself (event.currentTarget),
                // assume it's meant to be interactive independently.
                return;
            }
            targetElement = targetElement.parentElement as HTMLElement;
        }

        // After checking children, ensure the row (event.currentTarget / the <tr> itself) isn't an inherently interactive tag.
        // This is mostly a safeguard, as a <tr> shouldn't typically be one of these tags.
        // We don't check event.currentTarget.onclick because WE are setting it.
        if (interactiveTags.includes((event.currentTarget as HTMLElement).tagName)) {
            return;
        }

        toggleRowExpansion(rowId);
    };

    return (
        <tbody className="divide-y divide-gray-200 bg-white">
            {data.length === 0 ? (
                <tr>
                    <td
                        colSpan={columns.length + (actions ? 1 : 0) + (detailPanel ? 1 : 0)}
                        className="px-4 py-8 text-center text-gray-500"
                    >
                        No data available
                    </td>
                </tr>
            ) : (
                data.map((row) => {
                    const rowId = getRowId(row);
                    const isExpanded = expandedRows[rowId] || false;

                    return (
                        <Fragment key={rowId}>
                            <tr
                                className={`transition-colors ${
                                    detailPanel ? "cursor-pointer" : ""
                                } ${hoveredRowId === rowId ? "bg-secondary-50" : ""}`}
                                onMouseEnter={() => setHoveredRowId(rowId)}
                                onMouseLeave={() => setHoveredRowId(null)}
                                onClick={(e) => handleRowClick(e, rowId)}
                            >
                                {/* Expansion column - only show icon if detailPanel exists */}
                                {detailPanel && (
                                    <td className="w-10 px-4 py-4">
                                        <ChevronRightIcon
                                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                                isExpanded ? "transform rotate-90 text-primary-500" : ""
                                            }`}
                                        />
                                    </td>
                                )}

                                {/* Row data */}
                                {columns.map((column) => (
                                    <td key={column.key} className="px-4 py-4 text-sm text-gray-700">
                                        {column.accessor ? (
                                            column.accessor(row)
                                        ) : row[column.key] !== undefined && row[column.key] !== null ? (
                                            <HighlightedText text={String(row[column.key])} highlight={searchQuery} />
                                        ) : (
                                            ""
                                        )}
                                    </td>
                                ))}

                                {/* Actions column */}
                                {actions && (
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        <RowActions actions={actions(row)} />
                                    </td>
                                )}
                            </tr>

                            {/* Detail panel */}
                            {isExpanded && detailPanel && (
                                <tr>
                                    <td
                                        colSpan={
                                            columns.length +
                                            (actions ? 1 : 0) +
                                            (typeof detailPanel !== "undefined" ? 1 : 0)
                                        }
                                    >
                                        <div className="px-8 py-4 bg-secondary-50 border-t border-b border-secondary-100">
                                            {detailPanel(row)}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    );
                })
            )}
        </tbody>
    );
}
