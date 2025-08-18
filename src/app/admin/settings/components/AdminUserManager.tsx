"use client";

import { useState, useTransition } from "react";
import { updateTableRecord } from "@/app/actions/admin";
import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import {
  ShieldCheckIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

// This would typically come from a server action, but for now we'll use a placeholder
interface AdminUser {
  id: string;
  name: string;
  email: string;
  isGlobalAdmin: boolean;
  createdAt: Date;
}

/**
 * Component for managing global admin users
 */
export default function AdminUserManager() {
  const [isPending, startTransition] = useTransition();
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<AdminUser | null>(null);
  const [adminUsers] = useState<AdminUser[]>([]); // This would come from a server action

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    startTransition(async () => {
      try {
        // This is a placeholder - you'd implement a proper user search server action
        toast.success("User search functionality would be implemented here");

        // Placeholder found user for demo
        setFoundUser({
          id: "demo-user-id",
          name: "Demo User",
          email: searchEmail,
          isGlobalAdmin: false,
          createdAt: new Date(),
        });
      } catch (error) {
        console.error("Error searching user:", error);
        toast.error("Error searching for user");
      }
    });
  };

  const handleToggleAdminStatus = async (
    userId: string,
    currentStatus: boolean,
  ) => {
    const action = currentStatus
      ? "remove admin access from"
      : "grant admin access to";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user? This will ${currentStatus ? "remove" : "grant"} their ability to access the admin panel.`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        const result = await updateTableRecord("user", userId, {
          isGlobalAdmin: !currentStatus,
        });

        if (result.success) {
          toast.success(
            `Admin status ${currentStatus ? "removed" : "granted"} successfully`,
          );
          // Update local state
          if (foundUser && foundUser.id === userId) {
            setFoundUser({
              ...foundUser,
              isGlobalAdmin: !currentStatus,
            });
          }
        } else {
          toast.error(result.error || "Failed to update admin status");
        }
      } catch (error) {
        console.error("Error updating admin status:", error);
        toast.error("Failed to update admin status");
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Search Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Search User by Email
        </h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <TextField
              label=""
              placeholder="Enter user email address"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              disabled={isPending}
              type="email"
            />
          </div>
          <Button
            onClick={handleSearchUser}
            disabled={isPending || !searchEmail.trim()}
            className="flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Found User */}
      {foundUser && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Search Result
          </h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {foundUser.isGlobalAdmin ? (
                  <ShieldCheckIcon className="h-10 w-10 text-green-500" />
                ) : (
                  <UserIcon className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {foundUser.name}
                </h4>
                <p className="text-gray-600">{foundUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      foundUser.isGlobalAdmin
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {foundUser.isGlobalAdmin ? "Global Admin" : "Regular User"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() =>
                handleToggleAdminStatus(foundUser.id, foundUser.isGlobalAdmin)
              }
              disabled={isPending}
              variant={foundUser.isGlobalAdmin ? "danger" : "primary"}
            >
              {foundUser.isGlobalAdmin ? "Remove Admin" : "Make Admin"}
            </Button>
          </div>
        </div>
      )}

      {/* Current Admin Users */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Current Global Admins
        </h3>

        {adminUsers.length === 0 ? (
          <div className="text-center py-8">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-lg font-medium text-gray-900">
              No Admin Users
            </h4>
            <p className="mt-1 text-gray-600">
              Search for users above to grant them admin access.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {adminUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <ShieldCheckIcon className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Admin since {user.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleToggleAdminStatus(user.id, true)}
                  disabled={isPending}
                  className="text-sm"
                >
                  Remove Admin
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Important Notice
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Global admin access allows full control over all database
                  tables and system settings.
                </li>
                <li>
                  Only grant admin access to trusted users who need to manage
                  the system.
                </li>
                <li>
                  Admin actions are logged and can be audited through the
                  database tables.
                </li>
                <li>
                  You cannot remove your own admin status - have another admin
                  do it if needed.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
