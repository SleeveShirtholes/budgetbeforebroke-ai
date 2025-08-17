import { Suspense } from "react";
import { getCurrentUserWithAdmin } from "@/lib/auth-helpers";
import AdminUserManager from "./components/AdminUserManager";
import SystemSettings from "./components/SystemSettings";

/**
 * Admin settings page for managing system configuration and admin users
 */
export default async function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage system settings, admin users, and global configuration options.
        </p>
      </div>

      {/* Current User Info */}
      <Suspense fallback={<CurrentUserLoading />}>
        <CurrentUserInfo />
      </Suspense>

      {/* Admin User Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Admin User Management
          </h2>
          <p className="text-gray-600">
            Manage users with global admin access.
          </p>
        </div>
        <Suspense fallback={<AdminUsersLoading />}>
          <AdminUserManager />
        </Suspense>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            System Configuration
          </h2>
          <p className="text-gray-600">
            Configure system-wide settings and preferences.
          </p>
        </div>
        <SystemSettings />
      </div>
    </div>
  );
}

/**
 * Component showing current user information
 */
async function CurrentUserInfo() {
  try {
    const currentUser = await getCurrentUserWithAdmin();

    if (!currentUser) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">
            Unable to load current user information
          </p>
        </div>
      );
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">
          Current Admin User
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-700">
              Name
            </label>
            <p className="text-blue-900">{currentUser.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700">
              Email
            </label>
            <p className="text-blue-900">{currentUser.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700">
              Admin Status
            </label>
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Global Admin
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700">
              User ID
            </label>
            <p className="text-blue-900 font-mono text-sm">{currentUser.id}</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading current user:", error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading current user information</p>
      </div>
    );
  }
}

/**
 * Loading state for current user
 */
function CurrentUserLoading() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded mb-1 w-16"></div>
            <div className="h-5 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading state for admin users
 */
function AdminUsersLoading() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse"
          >
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
