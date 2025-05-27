"use client";

import { formatDate } from "@/utils/date";
import { getAccountInformation } from "../actions";
import useSWR from "swr";

/**
 * AccountInformation Component
 *
 * Displays key account information including creation date and last login time
 * in a two-column grid layout.
 *
 * @returns {JSX.Element} A grid layout displaying account information
 */
export default function AccountInformation() {
  const { data, error, isLoading } = useSWR(
    "accountInformation",
    getAccountInformation,
  );

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-600">Failed to load account information</div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-secondary-600">Account Created</p>
            <p className="text-secondary-900">Loading...</p>
          </div>
          <div>
            <p className="text-sm text-secondary-600">Last Login</p>
            <p className="text-secondary-900">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    // Main container with vertical spacing
    <div className="space-y-4">
      {/* Two-column grid layout for account details */}
      <div className="grid grid-cols-2 gap-4">
        {/* Account creation date section */}
        <div>
          <p className="text-sm text-secondary-600">Account Created</p>
          <p className="text-secondary-900">
            {formatDate(data.accountCreated)}
          </p>
        </div>
        {/* Last login date section */}
        <div>
          <p className="text-sm text-secondary-600">Last Login</p>
          <p className="text-secondary-900">{formatDate(data.lastLogin)}</p>
        </div>
      </div>
    </div>
  );
}
