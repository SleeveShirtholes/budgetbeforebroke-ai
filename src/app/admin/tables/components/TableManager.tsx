"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  // ViewColumnsIcon,
  // Squares2X2Icon,
  // ArrowUpIcon,
  // ArrowDownIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import SearchInput from "@/components/Forms/SearchInput";
import TruncatedCell from "@/components/Table/TruncatedCell";
import { deleteTableRecord, type TableName } from "@/app/actions/admin";
import TableRecordModal from "./TableRecordModal";
import { toast } from "react-hot-toast";
import type { TableSchema, Pagination } from "@/types/admin";

interface Props {
  tableName: TableName;
  data: Record<string, unknown>[];
  pagination: Pagination;
  schema: TableSchema;
  initialSearch: string;
  isReadonly: boolean;
}

/**
 * TableManager component providing full CRUD operations for database tables
 */
export default function TableManager({
  tableName,
  data,
  pagination,
  schema,
  initialSearch,
  isReadonly,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedRecord, setSelectedRecord] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create" | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  // const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Handle search
  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    const params = new URLSearchParams(searchParams);
    if (newSearchTerm) {
      params.set("search", newSearchTerm);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to first page
    router.push(`/admin/tables/${tableName}?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/admin/tables/${tableName}?${params.toString()}`);
  };

  // Handle record actions
  const handleView = (record: Record<string, unknown>) => {
    setSelectedRecord(record);
    setModalMode("view");
  };

  const handleEdit = (record: Record<string, unknown>) => {
    if (isReadonly) return;

    setSelectedRecord(record);
    setModalMode("edit");
  };

  const handleCreate = () => {
    if (isReadonly) return;
    setSelectedRecord(null);
    setModalMode("create");
  };

  const handleDelete = async (record: Record<string, unknown>) => {
    if (isReadonly) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this ${tableName} record? This action cannot be undone.`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        const recordId = record.id;
        if (typeof recordId !== "string") {
          toast.error("Invalid record ID");
          return;
        }

        const result = await deleteTableRecord(tableName, recordId);
        if (result.success) {
          toast.success("Record deleted successfully");
          router.refresh(); // Refresh the page to show updated data
        } else {
          toast.error(result.error || "Failed to delete record");
        }
      } catch (error) {
        console.error("Error deleting record:", error);
        toast.error("Failed to delete record");
      }
    });
  };

  const handleModalClose = () => {
    setSelectedRecord(null);
    setModalMode(null);
    router.refresh(); // Refresh to show any changes
  };

  // Generate table columns based on the data
  const generateColumns = () => {
    if (!data.length) return [];

    const sampleRecord = data[0];
    const columns = Object.keys(sampleRecord).map((key) => ({
      key,
      id: key,
      header: key.replace(/([A-Z])/g, " $1").trim(),
      accessorKey: key,
      cell: ({ getValue }: { getValue: () => unknown }) => {
        const value = getValue();

        // Handle different data types
        if (value === null || value === undefined) {
          return <span className="text-gray-400 italic">null</span>;
        }

        if (typeof value === "boolean") {
          return (
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value ? "True" : "False"}
            </span>
          );
        }

        if (typeof value === "string" && value.length > 50) {
          return (
            <div className="truncate" title={value}>
              {value.substring(0, 50)}...
            </div>
          );
        }

        if (value instanceof Date) {
          return value.toLocaleDateString();
        }

        return String(value);
      },
      sortable: true,
    }));

    return columns;
  };

  // Generate columns for the table
  generateColumns();

  // Generate row actions
  const getRowActions = (record: Record<string, unknown>) => {
    const actions = [
      {
        label: "View",
        icon: <EyeIcon className="h-4 w-4" />,
        onClick: () => handleView(record),
      },
    ];

    if (!isReadonly) {
      actions.push(
        {
          label: "Edit",
          icon: <PencilIcon className="h-4 w-4" />,
          onClick: () => handleEdit(record),
        },
        {
          label: "Delete",
          icon: <TrashIcon className="h-4 w-4" />,
          onClick: () => handleDelete(record),
        },
      );
    }

    return actions;
  };

  const renderFieldValue = (key: string, value: unknown) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "True" : "False"}
        </span>
      );
    }

    if (typeof value === "string") {
      // Use TruncatedCell for strings with a reasonable character limit
      return (
        <TruncatedCell content={value} maxWidth={200} className="text-sm" />
      );
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    // For other types, convert to string and truncate if needed
    const stringValue = String(value);
    if (stringValue.length > 50) {
      return (
        <TruncatedCell
          content={stringValue}
          maxWidth={200}
          className="text-sm"
        />
      );
    }

    return <span className="text-sm">{stringValue}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {schema.tableName
                .replace(/([A-Z])/g, " $1")
                .trim()
                .replace(/^\w/, (c) => c.toUpperCase())}{" "}
              Records
            </h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {pagination.totalItems} total
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Add New Record Button */}
            {!isReadonly && schema.editableFields.length > 0 && (
              <Button
                onClick={handleCreate}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add New Record
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar - Positioned below the main controls */}
        {schema.searchFields.length > 0 && (
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Search across:{" "}
              <span className="font-medium">
                {schema.searchFields.join(", ")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-80">
                <SearchInput
                  placeholder={`Search ${schema.searchFields.join(", ")}...`}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full"
                />
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => handleSearch("")}
                  className="text-sm"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FunnelIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No records found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria."
                : `No records exist in the ${tableName} table yet.`}
            </p>
            {!isReadonly && !searchTerm && schema.editableFields.length > 0 && (
              <Button onClick={handleCreate} className="mt-4">
                Create First Record
              </Button>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {data.map((record, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(record).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {renderFieldValue(key, value)}
                      </dd>
                    </div>
                  ))}
                </div>

                {/* Row Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                  {getRowActions(record).map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={action.onClick}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {action.icon && (
                        <span className="mr-2">{action.icon}</span>
                      )}
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Pagination */}
        {data.length > 0 && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.totalItems,
                )}{" "}
                of {pagination.totalItems} results
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev || isPending}
                  className="text-sm"
                >
                  Previous
                </Button>

                {/* Page numbers */}
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const page = Math.max(1, pagination.page - 2) + i;
                    if (page > pagination.totalPages) return null;

                    return (
                      <Button
                        key={page}
                        variant={
                          page === pagination.page ? "primary" : "outline"
                        }
                        onClick={() => handlePageChange(page)}
                        disabled={isPending}
                        className="text-sm w-10 h-10 p-0"
                      >
                        {page}
                      </Button>
                    );
                  },
                )}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext || isPending}
                  className="text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <TableRecordModal
          isOpen={!!modalMode}
          tableName={tableName}
          schema={schema}
          record={selectedRecord}
          mode={modalMode}
          onClose={handleModalClose}
          onSave={handleModalClose}
        />
      )}
    </div>
  );
}
