import { getAccounts, getDefaultAccount } from "@/app/actions/account";

import type { AccountWithMembers } from "@/app/actions/account";
import { useEffect } from "react";
import useSWR from "swr";
import { create } from "zustand";
import type { Account } from "./accountStore";

interface BudgetAccountState {
  selectedAccount: Account | null;
  accounts: Account[];
  isLoading: boolean;
  error: Error | null;
  setSelectedAccount: (account: Account) => void;
  setAccounts: (accounts: Account[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

const useBudgetAccountStore = create<BudgetAccountState>((set) => ({
  selectedAccount: null,
  accounts: [],
  isLoading: false,
  error: null,
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  setAccounts: (accounts) => set({ accounts }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// Helper function to map API response to Account type
function mapAccountWithMembersToAccount(account: AccountWithMembers): Account {
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    nickname: account.name, // Use name as nickname
    users: account.members.map((m) => ({
      id: m.userId,
      email: m.user.email,
      name: m.user.name,
      role: m.role as "owner" | "member",
      avatar: m.user.image || undefined,
      accepted: true, // Assume accepted for now
    })),
    invitations:
      account.invitations?.map((inv) => ({
        id: inv.id,
        inviteeEmail: inv.inviteeEmail,
        role: inv.role,
        status: inv.status,
        createdAt: inv.createdAt,
      })) || [],
    createdAt: new Date().toISOString(), // Placeholder
    updatedAt: new Date().toISOString(), // Placeholder
  };
}

// Custom hook to handle data fetching and default account selection
export function useBudgetAccount() {
  const { data: accountsRaw = [], isLoading: isLoadingAccounts } = useSWR(
    "accounts",
    getAccounts,
  );
  const { data: defaultAccountId, isLoading: isLoadingDefault } = useSWR(
    "default-account",
    getDefaultAccount,
  );
  const { selectedAccount, setSelectedAccount, setAccounts, setIsLoading } =
    useBudgetAccountStore();

  // Effect to handle loading state and account mapping
  useEffect(() => {
    setIsLoading(isLoadingAccounts || isLoadingDefault);
  }, [isLoadingAccounts, isLoadingDefault, setIsLoading]);

  // Effect to handle account updates
  useEffect(() => {
    if (accountsRaw.length > 0) {
      const mappedAccounts = accountsRaw.map(mapAccountWithMembersToAccount);
      setAccounts(mappedAccounts);
    }
  }, [accountsRaw, setAccounts]);

  // Effect to handle default account selection
  useEffect(() => {
    if (!accountsRaw.length || !defaultAccountId) return;

    const mappedAccounts = accountsRaw.map(mapAccountWithMembersToAccount);
    const defaultAccount = mappedAccounts.find(
      (a) => a.id === defaultAccountId,
    );

    // Only set the default account if none is selected
    if (!selectedAccount) {
      if (defaultAccount) {
        setSelectedAccount(defaultAccount);
      } else if (mappedAccounts.length > 0) {
        setSelectedAccount(mappedAccounts[0]);
      }
    }
  }, [defaultAccountId, accountsRaw, selectedAccount, setSelectedAccount]);

  return useBudgetAccountStore();
}

export default useBudgetAccountStore;
