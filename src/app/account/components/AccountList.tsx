import {
  BuildingOfficeIcon,
  ChevronRightIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import Card from "@/components/Card";
import { Account } from "@/stores/accountStore";

interface AccountListProps {
  accounts: Account[];
  selectedAccount: Account | null;
  onAccountSelect: (account: Account) => void;
}

/**
 * AccountList Component
 *
 * Displays a list of accounts that the user has access to. Each account card shows:
 * - Account nickname
 * - Account number
 * - Number of members
 * - Visual indication of the currently selected account
 *
 * @param {Account[]} accounts - Array of account objects to display
 * @param {Account | null} selectedAccount - The currently selected account
 * @param {(account: Account) => void} onAccountSelect - Callback function when an account is selected
 */
export default function AccountList({
  accounts,
  selectedAccount,
  onAccountSelect,
}: AccountListProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow rounded-2xl">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Accounts</h2>
          <div className="text-sm text-gray-500">
            {accounts.length} {accounts.length === 1 ? "Account" : "Accounts"}
          </div>
        </div>
        <div className="space-y-3">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => onAccountSelect(account)}
              className={`w-full text-left p-4 rounded-xl border border-gray-200 transition-all duration-300 ease-in-out ${
                selectedAccount?.id === account.id
                  ? "bg-primary-50 shadow-lg shadow-primary-100/50 scale-[1.02] border-primary-200"
                  : "bg-white hover:shadow-lg hover:shadow-gray-100/50 hover:scale-[1.02] hover:-translate-y-0.5"
              } group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-50/0 via-primary-50/0 to-primary-50/0 group-hover:from-primary-50/10 group-hover:via-primary-50/5 group-hover:to-primary-50/0 transition-all duration-300" />
              <div className="flex items-start justify-between relative">
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg transition-colors duration-300 ${
                      selectedAccount?.id === account.id
                        ? "bg-primary-100 text-primary-600"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    }`}
                  >
                    <BuildingOfficeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {account.nickname}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {account.accountNumber}
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <UserGroupIcon className="w-4 h-4 mr-1" />
                      {account.users.length}{" "}
                      {account.users.length === 1 ? "Member" : "Members"}
                    </div>
                  </div>
                </div>
                <ChevronRightIcon
                  className={`w-5 h-5 text-gray-400 transition-all duration-300 ${
                    selectedAccount?.id === account.id
                      ? "transform rotate-90"
                      : ""
                  }`}
                />
              </div>
            </button>
          ))}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl border border-dashed border-primary-200 text-primary-600 bg-primary-50 hover:bg-primary-100 hover:border-primary-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            // No onClick yet, as requested
          >
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Create New Account</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
