"use client";

import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/20/solid";
import Table, { ColumnDef } from "./index";

import { useState } from "react";

/**
 * Example implementation of the Table component showcasing various features:
 * - Sortable and filterable columns
 * - Custom cell rendering with status badges
 * - Expandable rows with detail panels
 * - Row actions (edit, delete, activate/deactivate)
 * - Pagination with toggle
 *
 * This component serves as a demonstration and reference for implementing
 * the Table component with different features and customizations.
 */

interface ExampleData extends Record<string, unknown> {
    id: number;
    name: string;
    email: string;
    status: string;
    amount: number;
    date: string;
}

const mockData: ExampleData[] = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        status: "Active",
        amount: 120.5,
        date: "2023-05-10",
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        status: "Inactive",
        amount: 85.25,
        date: "2023-05-15",
    },
    {
        id: 3,
        name: "Mike Johnson",
        email: "mike@example.com",
        status: "Pending",
        amount: 250.0,
        date: "2023-05-20",
    },
    {
        id: 4,
        name: "Sarah Williams",
        email: "sarah@example.com",
        status: "Active",
        amount: 175.75,
        date: "2023-05-22",
    },
    {
        id: 5,
        name: "David Brown",
        email: "david@example.com",
        status: "Active",
        amount: 310.25,
        date: "2023-05-28",
    },
];

export default function TableExample() {
    const [data, setData] = useState<ExampleData[]>(mockData);
    const [showPagination, setShowPagination] = useState(true);

    // Define columns
    const columns: ColumnDef<ExampleData>[] = [
        {
            key: "name",
            header: "Name",
            sortable: true,
            filterable: true,
            filterPlaceholder: "Filter name...",
        },
        {
            key: "email",
            header: "Email",
            sortable: true,
            filterable: true,
            filterPlaceholder: "Filter email...",
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            filterable: true,
            filterPlaceholder: "Filter status...",
            accessor: (row) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${
                        row.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : row.status === "Inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            key: "amount",
            header: "Amount",
            sortable: true,
            filterable: true,
            filterPlaceholder: "Filter amount...",
            accessor: (row) => `$${row.amount.toFixed(2)}`,
        },
        {
            key: "date",
            header: "Date",
            sortable: true,
            filterable: true,
            filterPlaceholder: "Filter date...",
            accessor: (row) => {
                const date = new Date(row.date);
                return date.toLocaleDateString();
            },
        },
    ];

    // Detail panel content
    const detailPanel = (row: ExampleData) => (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Account ID</p>
                    <p className="text-base">{`ACC-${row.id.toString().padStart(6, "0")}`}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-base">{new Date(row.date).toDateString()}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-base">2 days ago</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Transactions</p>
                    <p className="text-base">{Math.floor(Math.random() * 20) + 1}</p>
                </div>
            </div>
        </div>
    );

    // Row actions
    const getRowActions = (row: ExampleData) => [
        {
            label: "Edit",
            icon: <PencilIcon className="w-5 h-5" />,
            onClick: () => alert(`Edit ${row.name}`),
        },
        {
            label: "Delete",
            icon: <TrashIcon className="w-5 h-5" />,
            onClick: () => {
                if (confirm(`Are you sure you want to delete ${row.name}?`)) {
                    setData(data.filter((item) => item.id !== row.id));
                }
            },
        },
        {
            label: row.status === "Active" ? "Deactivate" : "Activate",
            icon: <EyeIcon className="w-5 h-5" />,
            onClick: () => {
                setData(
                    data.map((item) =>
                        item.id === row.id
                            ? {
                                  ...item,
                                  status: item.status === "Active" ? "Inactive" : "Active",
                              }
                            : item
                    )
                );
            },
        },
    ];

    // Track pagination state for demonstration purposes
    const handlePaginationChange = (newShowPagination: boolean) => {
        setShowPagination(newShowPagination);
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Table Component Example</h1>
                <p className="text-gray-600 mt-2">Try the table features:</p>
                <ul className="text-gray-600 mt-1 list-disc ml-5 text-sm">
                    <li>Click column headers to sort</li>
                    <li>
                        Click the filter funnel icon <span className="inline-block align-text-bottom">🔍</span> next to
                        each column header to filter
                    </li>
                    <li>Click the lines icon to toggle between pagination and showing all rows</li>
                    <li>Click the arrow on each row to expand for details</li>
                    <li>Use the action menu on each row to perform operations</li>
                </ul>
            </div>

            <Table
                data={data}
                columns={columns}
                detailPanel={detailPanel}
                actions={getRowActions}
                pageSize={3}
                showPagination={showPagination}
                onPaginationChange={handlePaginationChange}
            />
        </div>
    );
}
