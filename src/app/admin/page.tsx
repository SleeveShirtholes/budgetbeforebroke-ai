import { Suspense } from "react";
import { getAvailableTables } from "@/app/actions/admin";
import { getContactSubmissions } from "@/app/actions/contact";
import StatsCard from "@/components/StatsCard";
import {
  UsersIcon,
  TableCellsIcon,
  EnvelopeIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/components/Button";

/**
 * Admin dashboard overview page
 * Displays key statistics and quick access to admin functions
 */
export default async function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your application&apos;s database tables, users, and system
          settings.
        </p>
      </div>

      {/* Stats Overview */}
      <Suspense fallback={<StatsLoading />}>
        <StatsOverview />
      </Suspense>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            href="/admin/tables"
            variant="outline"
            className="justify-start h-auto p-4"
          >
            <TableCellsIcon className="h-6 w-6 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Database Tables</div>
              <div className="text-sm text-gray-500">Manage all tables</div>
            </div>
          </Button>

          <Button
            href="/admin/tables/user"
            variant="outline"
            className="justify-start h-auto p-4"
          >
            <UsersIcon className="h-6 w-6 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-medium">User Management</div>
              <div className="text-sm text-gray-500">View and edit users</div>
            </div>
          </Button>

          <Button
            href="/admin/contact-submissions"
            variant="outline"
            className="justify-start h-auto p-4"
          >
            <EnvelopeIcon className="h-6 w-6 mr-3 text-purple-600" />
            <div className="text-left">
              <div className="font-medium">Contact Support</div>
              <div className="text-sm text-gray-500">Manage submissions</div>
            </div>
          </Button>

          <Button
            href="/admin/settings"
            variant="outline"
            className="justify-start h-auto p-4"
          >
            <CogIcon className="h-6 w-6 mr-3 text-gray-600" />
            <div className="text-left">
              <div className="font-medium">Admin Settings</div>
              <div className="text-sm text-gray-500">System configuration</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Available Database Tables
        </h2>
        <Suspense fallback={<TablesLoading />}>
          <TablesOverview />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Stats overview component showing key system statistics
 */
async function StatsOverview() {
  try {
    const [tablesResult, contactsResult] = await Promise.all([
      getAvailableTables(),
      getContactSubmissions(),
    ]);

    const stats = [
      {
        name: "Database Tables",
        value: tablesResult.length.toString(),
        icon: TableCellsIcon,
        color: "blue" as const,
      },
      {
        name: "Contact Submissions",
        value: contactsResult.success
          ? contactsResult.submissions?.length.toString() || "0"
          : "0",
        icon: EnvelopeIcon,
        color: "purple" as const,
      },
      {
        name: "Editable Tables",
        value: tablesResult
          .filter((table) => table.editableFields.length > 0)
          .length.toString(),
        icon: CogIcon,
        color: "green" as const,
      },
      {
        name: "System Status",
        value: "Online",
        icon: UsersIcon,
        color: "gray" as const,
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard
            key={stat.name}
            name={stat.name}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error loading stats:", error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading statistics</p>
      </div>
    );
  }
}

/**
 * Tables overview component showing available database tables
 */
async function TablesOverview() {
  try {
    const tables = await getAvailableTables();

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.slice(0, 9).map((table) => (
          <Link
            key={table.name}
            href={`/admin/tables/${table.name}`}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="font-medium text-gray-900">{table.displayName}</div>
            <div className="text-sm text-gray-500 mt-1">
              {table.editableFields.length} editable fields
            </div>
            <div className="text-sm text-gray-500">
              {table.searchFields.length} searchable fields
            </div>
          </Link>
        ))}

        {tables.length > 9 && (
          <Link
            href="/admin/tables"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 transition-colors flex items-center justify-center"
          >
            <div className="text-center text-gray-600">
              <div className="font-medium">View All Tables</div>
              <div className="text-sm">+{tables.length - 9} more tables</div>
            </div>
          </Link>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading tables:", error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading tables</p>
      </div>
    );
  }
}

/**
 * Loading state for stats
 */
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Loading state for tables
 */
function TablesLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="p-4 border border-gray-200 rounded-lg animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}
