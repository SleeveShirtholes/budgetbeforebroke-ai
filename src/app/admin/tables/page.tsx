import { Suspense } from "react";
import { getAvailableTables } from "@/app/actions/admin";
import Link from "next/link";
import {
  TableCellsIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import SearchInput from "@/components/Forms/SearchInput";

/**
 * Database tables listing page
 * Shows all available tables with their configuration and provides access to manage them
 */
export default async function TablesPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  const search = searchParams?.search || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Database Tables</h1>
        <p className="mt-2 text-gray-600">
          Manage all database tables in your application. Click on any table to
          view and edit its data.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="max-w-md">
          <SearchInput
            placeholder="Search tables..."
            defaultValue={search}
            className="w-full"
          />
        </div>
      </div>

      {/* Tables Grid */}
      <Suspense fallback={<TablesLoading />}>
        <TablesGrid searchTerm={search} />
      </Suspense>
    </div>
  );
}

/**
 * Component that displays the grid of available tables
 */
async function TablesGrid({ searchTerm }: { searchTerm: string }) {
  try {
    const tables = await getAvailableTables();

    // Filter tables based on search term
    const filteredTables = searchTerm
      ? tables.filter(
          (table) =>
            table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            table.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : tables;

    if (filteredTables.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No tables found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search term."
                : "No database tables are available."}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map((table) => (
          <div
            key={table.name}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {table.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Table:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {table.name}
                    </code>
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <PencilIcon className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-600">
                        {table.editableFields.length} editable field
                        {table.editableFields.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <EyeIcon className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-gray-600">
                        {table.searchFields.length} searchable field
                        {table.searchFields.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {table.editableFields.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        EDITABLE FIELDS:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {table.editableFields.slice(0, 3).map((field) => (
                          <span
                            key={field}
                            className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                          >
                            {field}
                          </span>
                        ))}
                        {table.editableFields.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{table.editableFields.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/tables/${table.name}`}
                  className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Manage Table
                </Link>
                <Link
                  href={`/admin/tables/${table.name}?view=readonly`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  View Only
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error loading tables:", error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Error loading database tables</p>
      </div>
    );
  }
}

/**
 * Loading state for tables grid
 */
function TablesLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-gray-200 rounded"></div>
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
