"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { AccountWithMembers } from "@/app/actions/account";
import { getAccounts } from "@/app/actions/account";
import { useDefaultAccount } from "@/hooks/useDefaultAccount";
import type { Account } from "@/stores/accountStore";
import useSWR from "swr";

interface BudgetAccountContextType {
  selectedAccount: Account | null;
  setSelectedAccount: (account: Account) => void;
  accounts: Account[];
  isLoading: boolean;
  error: Error | null;
}

const BudgetAccountContext = createContext<BudgetAccountContextType | null>(
  null,
);

// Map AccountWithMembers (from server) to UI Account type
function mapAccountWithMembersToAccount(account: AccountWithMembers): Account {
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    nickname: account.name, // Use name as nickname
    users: account.members.map((m: AccountWithMembers["members"][number]) => ({
      id: m.userId,
      email: m.user.email,
      name: m.user.name,
      role: m.role as "owner" | "member",
      avatar: m.user.image || undefined,
      accepted: true, // Assume accepted for now
    })),
    invitations:
      account.invitations?.map(
        (inv: AccountWithMembers["invitations"][number]) => ({
          id: inv.id,
          inviteeEmail: inv.inviteeEmail,
          role: inv.role,
          status: inv.status,
          createdAt: inv.createdAt,
        }),
      ) || [],
    createdAt: new Date().toISOString(), // Placeholder
    updatedAt: new Date().toISOString(), // Placeholder
  };
}

export function BudgetAccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: accountsRaw = [], isLoading: isLoadingAccounts } = useSWR(
    "accounts",
    getAccounts,
  );
  const accounts: Account[] = (accountsRaw || []).map(
    mapAccountWithMembersToAccount,
  );
  const { defaultAccountId, isLoading: isLoadingDefault } = useDefaultAccount();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Only set the default account as selected on initial load or if no account is selected
  useEffect(() => {
    if (
      defaultAccountId &&
      accounts.length > 0 &&
      (!selectedAccount || !accounts.some((a) => a.id === selectedAccount.id))
    ) {
      const defaultAccount = accounts.find((a) => a.id === defaultAccountId);
      if (defaultAccount) {
        setSelectedAccount(defaultAccount);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAccountId, accounts]);

  const value = {
    selectedAccount,
    setSelectedAccount,
    accounts,
    isLoading: isLoadingAccounts || isLoadingDefault,
    error: null, // Add error handling if needed
  };

  return (
    <BudgetAccountContext.Provider value={value}>
      {children}
    </BudgetAccountContext.Provider>
  );
}

export function useBudgetAccount() {
  const context = useContext(BudgetAccountContext);
  if (!context) {
    throw new Error(
      "useBudgetAccount must be used within a BudgetAccountProvider",
    );
  }
  return context;
}
