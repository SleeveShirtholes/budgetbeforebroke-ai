"use client";

import {
  BuildingOfficeIcon,
  CheckIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import { useToast } from "@/components/Toast";
import type { Account } from "@/stores/accountStore";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import { useState } from "react";

export default function AccountSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();
  const { selectedAccount, setSelectedAccount, accounts } = useBudgetAccount();

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    showToast(
      `Successfully switched to ${account.nickname || account.accountNumber || "account"}`,
      {
        type: "success",
      },
    );
    setTimeout(() => setIsOpen(false), 120);
  };

  return (
    <div className="relative min-w-[260px] w-[300px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center w-full px-2 py-1 rounded-xl border border-gray-200 bg-white shadow transition focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm ${isOpen ? "ring-2 ring-primary-200" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{ fontWeight: 500, minHeight: 36 }}
        title="Switch between your budget accounts"
      >
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <span className="p-1 rounded bg-primary-50 text-primary-600">
            <BuildingOfficeIcon className="w-4 h-4" />
          </span>
          <span className="flex flex-col min-w-0 text-left leading-tight px-1 py-0.5">
            <span className="font-semibold text-secondary-900 truncate text-xs">
              {selectedAccount ? selectedAccount.nickname : "Select Account"}
            </span>
            {selectedAccount && (
              <span className="truncate mt-0.5 text-[10px] text-gray-500">
                {selectedAccount.accountNumber}
              </span>
            )}
          </span>
        </span>
        <span className="flex-shrink-0 ml-2 flex items-center justify-end">
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200">
          <ul className="py-1 max-h-56 overflow-y-auto text-sm">
            {accounts.map((account) => (
              <li
                key={account.id}
                className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded-lg transition text-secondary-900 hover:bg-primary-50 ${selectedAccount?.id === account.id ? "bg-primary-100 border border-primary-200" : ""}`}
                onClick={() => handleAccountSelect(account)}
              >
                <span
                  className={`p-1 rounded ${selectedAccount?.id === account.id ? "bg-primary-200 text-primary-700" : "bg-gray-100 text-gray-600"}`}
                >
                  <BuildingOfficeIcon className="w-4 h-4" />
                </span>
                <span className="flex flex-col min-w-0 leading-tight px-1 py-0.5">
                  <span className="font-medium truncate text-secondary-900 text-xs">
                    {account.nickname}
                  </span>
                  <span className="truncate mt-0.5 text-[10px] text-gray-500">
                    {account.accountNumber}
                  </span>
                </span>
                {selectedAccount?.id === account.id && (
                  <CheckIcon className="w-4 h-4 text-primary-600 ml-auto" />
                )}
              </li>
            ))}
          </ul>
          <div className="px-2 pb-2 pt-1 text-xs text-gray-500 text-center">
            <a
              href="/account"
              className="underline hover:text-primary-600 transition-colors cursor-pointer"
            >
              Manage accounts or change default
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
