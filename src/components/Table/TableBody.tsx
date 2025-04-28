"use client";

import { Fragment, ReactNode, useState } from "react";

import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import RowActions from "./RowActions";
import { ColumnDef } from "./types";

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
}

export default function TableBody<T extends Record<string, unknown>>({
    data,
    columns,
    expandedRows,
    toggleRowExpansion,
    detailPanel,
    actions,
}: TableBodyProps<T>) {
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

    // Get a unique ID from a row
    const getRowId = (row: T): string => {
        if ("id" in row && row.id !== undefined) return String(row.id);
        // If no id field, stringify the object as a fallback
        return JSON.stringify(row);
    };

    return (
        <tbody className="divide-y divide-gray-200 bg-white">
            {data.length === 0 ? (
                <tr>
                    <td colSpan={columns.length + (actions ? 2 : 1)} className="px-4 py-8 text-center text-gray-500">
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
                                className={`transition-colors ${hoveredRowId === rowId ? "bg-secondary-50" : ""}`}
                                onMouseEnter={() => setHoveredRowId(rowId)}
                                onMouseLeave={() => setHoveredRowId(null)}
                            >
                                {/* Expansion column */}
                                <td className="w-10 px-4 py-4">
                                    {detailPanel && (
                                        <button
                                            onClick={() => toggleRowExpansion(rowId)}
                                            className="text-gray-500 hover:text-primary-500 transition-colors"
                                        >
                                            <EllipsisVerticalIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>

                                {/* Row data */}
                                {columns.map((column) => (
                                    <td key={column.key} className="px-4 py-4 text-sm text-gray-700">
                                        {column.accessor
                                            ? column.accessor(row)
                                            : row[column.key] !== undefined && row[column.key] !== null
                                              ? String(row[column.key])
                                              : ""}
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
                                    <td colSpan={columns.length + (actions ? 2 : 1)}>
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
