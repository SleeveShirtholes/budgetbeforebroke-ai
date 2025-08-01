import { create } from "zustand";

export type AccountUser = {
  id: string;
  email: string;
  name: string;
  role: "owner" | "member";
  avatar?: string;
  accepted: boolean;
};

export type AccountInvitation = {
  id: string;
  inviteeEmail: string;
  role: string;
  status: string;
  createdAt: Date;
};

export type Account = {
  id: string;
  accountNumber: string;
  nickname: string;
  users: AccountUser[];
  invitations?: AccountInvitation[];
  createdAt: string;
  updatedAt: string;
};

interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  isInviteModalOpen: boolean;
  isEditModalOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAccounts: (accounts: Account[]) => void;
  setSelectedAccount: (account: Account | null) => void;
  setIsInviteModalOpen: (isOpen: boolean) => void;
  setIsEditModalOpen: (isOpen: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Account operations
  updateAccountNickname: (accountId: string, nickname: string) => void;
  inviteUser: (accountId: string, email: string) => Promise<void>;
  removeUser: (accountId: string, userId: string) => void;
  updateUserRole: (
    accountId: string,
    userId: string,
    role: "owner" | "member",
  ) => void;
  resendInvite: (accountId: string, userId: string) => void;
}

const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  selectedAccount: null,
  isInviteModalOpen: false,
  isEditModalOpen: false,
  isLoading: false,
  error: null,

  setAccounts: (accounts) => set({ accounts }),
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  setIsInviteModalOpen: (isOpen) => set({ isInviteModalOpen: isOpen }),
  setIsEditModalOpen: (isOpen) => set({ isEditModalOpen: isOpen }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  updateAccountNickname: (accountId, nickname) => {
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === accountId ? { ...account, nickname } : account,
      ),
      selectedAccount:
        state.selectedAccount?.id === accountId
          ? { ...state.selectedAccount, nickname }
          : state.selectedAccount,
    }));
  },

  inviteUser: async (accountId, email) => {
    try {
      set({ isLoading: true, error: null });
      // TODO: Implement API call to invite user
      // For now, we'll simulate the API call
      const newUser: AccountUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split("@")[0],
        role: "member",
        accepted: false,
      };

      set((state) => ({
        accounts: state.accounts.map((account) =>
          account.id === accountId
            ? { ...account, users: [...account.users, newUser] }
            : account,
        ),
        selectedAccount:
          state.selectedAccount?.id === accountId
            ? {
                ...state.selectedAccount,
                users: [...state.selectedAccount.users, newUser],
              }
            : state.selectedAccount,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to invite user",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  removeUser: (accountId, userId) => {
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === accountId
          ? {
              ...account,
              users: account.users.filter((user) => user.id !== userId),
            }
          : account,
      ),
      selectedAccount:
        state.selectedAccount?.id === accountId
          ? {
              ...state.selectedAccount,
              users: state.selectedAccount.users.filter(
                (user) => user.id !== userId,
              ),
            }
          : state.selectedAccount,
    }));
  },

  updateUserRole: (accountId, userId, role) => {
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === accountId
          ? {
              ...account,
              users: account.users.map((user) =>
                user.id === userId ? { ...user, role } : user,
              ),
            }
          : account,
      ),
      selectedAccount:
        state.selectedAccount?.id === accountId
          ? {
              ...state.selectedAccount,
              users: state.selectedAccount.users.map((user) =>
                user.id === userId ? { ...user, role } : user,
              ),
            }
          : state.selectedAccount,
    }));
  },

  resendInvite: (accountId, userId) => {
    // For demo, just log or show a toast
    // In real app, would call API
    // TODO: Implement actual API call using accountId and userId
    console.log(`Resending invite for account ${accountId} to user ${userId}`);
  },
}));

export default useAccountStore;
