"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  // ArrowUpIcon,
  // ArrowDownIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import SearchInput from "@/components/Forms/SearchInput";
import Table from "@/components/Table/Table";
import { deleteTableRecord, type TableName } from "@/app/actions/admin";
import TableRecordModal from "./TableRecordModal";
import { toast } from "react-hot-toast";

interface TableSchema {
  tableName: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  editableFields: string[];
  searchFields: string[];
}

interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Props {
  tableName: TableName;
  data: Record<string, any>[];
  pagination: Pagination;
  schema: TableSchema;
  initialSearch: string;
  initialSort?: string;
  initialDirection: "asc" | "desc";
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
  initialSort,
  initialDirection,
  isReadonly,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedRecord, setSelectedRecord] = useState<Record<
    string,
    any
  > | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create" | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState(initialSearch);

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

  // Handle sorting
  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get("sort");
    const currentDirection = params.get("direction") || "desc";

    if (currentSort === field) {
      // Toggle direction
      params.set("direction", currentDirection === "asc" ? "desc" : "asc");
    } else {
      // New field
      params.set("sort", field);
      params.set("direction", "asc");
    }

    router.push(`/admin/tables/${tableName}?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/admin/tables/${tableName}?${params.toString()}`);
  };

  // Handle record actions
  const handleView = (record: Record<string, any>) => {
    setSelectedRecord(record);
    setModalMode("view");
  };

  const handleEdit = (record: Record<string, any>) => {
    if (isReadonly) return;
    setSelectedRecord(record);
    setModalMode("edit");
  };

  const handleCreate = () => {
    if (isReadonly) return;
    setSelectedRecord(null);
    setModalMode("create");
  };

  const handleDelete = async (record: Record<string, any>) => {
    if (isReadonly) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this ${tableName} record? This action cannot be undone.`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        const result = await deleteTableRecord(tableName, record.id);
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
      id: key,
      header: key.replace(/([A-Z])/g, " $1").trim(),
      accessorKey: key,
      cell: ({ getValue }: any) => {
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
            <span title={value} className="truncate block max-w-xs">
              {value.substring(0, 50)}...
            </span>
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

  const columns = generateColumns();

  // Generate row actions
  const getRowActions = (record: Record<string, any>) => {
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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {schema.tableName.replace(/([A-Z])/g, " $1").trim()} Records
            </h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {pagination.totalItems} total
            </span>
          </div>

          {!isReadonly && schema.editableFields.length > 0 && (
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add New Record
            </Button>
          )}
        </div>

        {/* Search */}
        {schema.searchFields.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
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
          <div className="overflow-x-auto">
            <Table
              data={data}
              columns={columns}
              actions={getRowActions}
              showPagination={true}
              pageSize={pagination.pageSize}
            />
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
          tableName={tableName}
          schema={schema}
          record={selectedRecord}
          mode={modalMode}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
