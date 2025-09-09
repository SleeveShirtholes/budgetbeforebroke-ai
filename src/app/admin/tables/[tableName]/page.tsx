import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getTableData,
  getTableSchema,
  type TableName,
} from "@/app/actions/admin";
import TableManager from "../components/TableManager";
import Breadcrumb from "@/components/Breadcrumb";

interface Props {
  params: Promise<{ tableName: string }>;
  searchParams?: Promise<{
    page?: string;
    search?: string;
    sort?: string;
    direction?: "asc" | "desc";
    view?: "readonly" | "edit";
  }>;
}

/**
 * Dynamic table management page
 * Provides full CRUD operations for any database table
 */
export default async function TablePage({ params, searchParams }: Props) {
  const { tableName } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams?.page || "1");
  const search = resolvedSearchParams?.search || "";
  const sort = resolvedSearchParams?.sort;
  const direction = resolvedSearchParams?.direction || "desc";
  const isReadonly = resolvedSearchParams?.view === "readonly";

  // Validate table name
  const validTableNames = [
    "user",
    "budgetAccounts",
    "budgetAccountMembers",
    "budgetAccountInvitations",
    "budgets",
    "categories",
    "budgetCategories",
    "transactions",
    "goals",
    "plaidItems",
    "plaidAccounts",
    "incomeSources",
    "debts",
    "debtAllocations",
    "monthlyDebtPlanning",
    "supportRequests",
    "supportComments",
    "dismissedWarnings",
    "contactSubmissions",
    "emailConversations",
    "session",
    "account",
    "verification",
    "passkey",
  ];

  if (!validTableNames.includes(tableName)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {tableName
            .replace(/([A-Z])/g, " $1")
            .trim()
            .replace(/^\w/, (c) => c.toUpperCase())}{" "}
          Management
        </h1>
        <p className="mt-2 text-gray-600">
          {isReadonly
            ? "View records in this table (read-only mode)."
            : "View, create, edit, and delete records in this table."}
        </p>
      </div>

      {/* Table Manager */}
      <Suspense fallback={<TableManagerLoading />}>
        <TableManagerWrapper
          tableName={tableName as TableName}
          page={page}
          search={search}
          sort={sort}
          direction={direction}
          isReadonly={isReadonly}
        />
      </Suspense>
    </div>
  );
}

/**
 * Wrapper component that loads table data and schema
 */
async function TableManagerWrapper({
  tableName,
  page,
  search,
  sort,
  direction,
  isReadonly,
}: {
  tableName: TableName;
  page: number;
  search: string;
  sort?: string;
  direction: "asc" | "desc";
  isReadonly: boolean;
}) {
  try {
    const [tableDataResult, schemaResult] = await Promise.all([
      getTableData(tableName, page, 50, search, sort, direction),
      getTableSchema(),
    ]);

    if (!tableDataResult.success || !tableDataResult.data) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">
            Error loading table data:{" "}
            {tableDataResult.error || "No data available"}
          </p>
        </div>
      );
    }

    return (
      <TableManager
        tableName={tableName}
        data={tableDataResult.data}
        pagination={tableDataResult.pagination}
        schema={{
          tableName,
          fields:
            schemaResult.success && schemaResult.data
              ? schemaResult.data.map((field) => ({
                  name: field.column_name,
                  type: field.data_type,
                  required: field.is_nullable === "NO",
                  defaultValue: field.column_default,
                }))
              : [],
          editableFields: [],
          searchFields: [],
        }}
        initialSearch={search}
        isReadonly={isReadonly}
      />
    );
  } catch (error) {
    console.error("Error loading table manager:", error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">
          Error loading table manager:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}

/**
 * Loading state for table manager
 */
function TableManagerLoading() {
  return (
    <div className="space-y-6">
      {/* Search and controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-full max-w-md animate-pulse"></div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 pb-4 border-b border-gray-200">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>

          {/* Table rows */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-4 py-4 border-b border-gray-100"
            >
              {[...Array(4)].map((_, j) => (
                <div
                  key={j}
                  className="h-4 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
