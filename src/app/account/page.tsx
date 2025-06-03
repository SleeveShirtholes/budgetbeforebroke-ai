"use client";

import {
  AccountWithMembers,
  deleteInvitation,
  getAccounts,
  inviteUser,
  removeUser,
  resendInvite,
  updateAccountName,
  updateUserRole,
} from "../actions/account";
import { useEffect, useRef, useState } from "react";

import type { Account } from "@/stores/accountStore";
import AccountDetails from "./components/AccountDetails";
import AccountList from "./components/AccountList";
import Card from "@/components/Card";
import ChangeRoleConfirmationModal from "./components/ChangeRoleConfirmationModal";
import CreateAccountModal from "./components/CreateAccountModal";
import EditNicknameModal from "./components/EditNicknameModal";
import InviteUserModal from "./components/InviteUserModal";
import { authClient } from "@/lib/auth-client";
import { createAccount } from "../actions/account";
import { useDefaultAccount } from "@/hooks/useDefaultAccount";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";

/**
 * Maps an AccountWithMembers (from server) to the Account type used by the UI components.
 */
function mapAccountWithMembersToAccount(account: AccountWithMembers): Account {
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    nickname: account.name, // Use name as nickname
    users: account.members.map((m) => ({
      id: m.userId, // This is the correct ID from the server
      email: m.user.email,
      name: m.user.name,
      role: m.role as "owner" | "member",
      avatar: m.user.image || undefined,
      accepted: true, // Assume accepted for now; can be improved with invitation status
    })),
    invitations:
      account.invitations?.map((inv) => ({
        id: inv.id,
        inviteeEmail: inv.inviteeEmail,
        role: inv.role,
        status: inv.status,
        createdAt: inv.createdAt,
      })) || [],
    createdAt: new Date().toISOString(), // Placeholder, not available from server
    updatedAt: new Date().toISOString(), // Placeholder, not available from server
  };
}

/**
 * AccountPage Component
 *
 * A page component that manages and displays account information and user management functionality.
 * Fetches account data from the server using SWR and displays a split view with an account list and details.
 *
 * Features:
 * - Display and selection of multiple accounts
 * - Account nickname management
 * - User invitation system
 * - User role management
 * - User removal functionality
 * - Invite resending capability
 */
function AccountPageContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const hasShownInviteToast = useRef(false);
  // Fetch accounts using SWR and the server action
  const {
    data: accountsRaw,
    isLoading,
    mutate,
  } = useSWR<AccountWithMembers[]>("accounts", getAccounts);

  // Map server accounts to UI accounts
  const accounts: Account[] = (accountsRaw || []).map(
    mapAccountWithMembersToAccount,
  );

  // Local state for selected account and modals
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [isRoleChangeModalOpen, setIsRoleChangeModalOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    newRole: string;
    userEmail: string;
  } | null>(null);

  const {
    defaultAccountId,
    updateDefault,
    isLoading: isLoadingDefault,
  } = useDefaultAccount();

  // Find the selected account object
  const selectedAccount: Account | null =
    accounts.find((a) => a.id === selectedAccountId) || null;

  // Get the current user's session to determine if they are an owner
  const { data: session } = authClient.useSession();

  // Determine if the current user is an owner of the selected account
  const isOwner =
    selectedAccount?.users.some(
      (user) => user.id === session?.user?.id && user.role === "owner",
    ) ?? false;

  // Handle account selection
  const handleAccountClick = (account: Account) => {
    setSelectedAccountId(selectedAccountId === account.id ? null : account.id);
  };

  // Handle user invitation
  const handleInviteUser = async () => {
    if (!selectedAccount || !inviteEmail || !isOwner) return;
    setIsInviteLoading(true);
    try {
      await inviteUser(selectedAccount.id, inviteEmail);
      setInviteEmail("");
      setIsInviteModalOpen(false);
      mutate(); // Re-fetch accounts to show the new invitation
      showToast("Invitation sent successfully!", { type: "success" });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "An invitation is already pending for this email"
      ) {
        // Find the existing invitation
        const existingInvitation = selectedAccount.invitations?.find(
          (inv) => inv.inviteeEmail === inviteEmail && inv.status === "pending",
        );

        if (existingInvitation) {
          // Show confirmation dialog to resend
          if (
            window.confirm(
              "An invitation is already pending for this email. Would you like to resend it?",
            )
          ) {
            try {
              await resendInvite(existingInvitation.id);
              setInviteEmail("");
              setIsInviteModalOpen(false);
              mutate(); // Re-fetch accounts
              showToast("Invitation resent successfully!", { type: "success" });
            } catch (resendError) {
              console.error("Failed to resend invitation:", resendError);
              showToast(
                "Failed to resend invitation. Please try again later.",
                { type: "error" },
              );
            }
          }
        }
      } else {
        console.error("Failed to invite user:", error);
        showToast(
          error instanceof Error
            ? error.message
            : "Failed to invite user. Please try again later.",
          {
            type: "error",
          },
        );
      }
    } finally {
      setIsInviteLoading(false);
    }
  };

  // Handle nickname update
  const handleUpdateNickname = async (newNickname: string): Promise<void> => {
    if (!selectedAccount) return;

    try {
      await updateAccountName(selectedAccount.id, newNickname);
      setIsEditModalOpen(false);
      mutate(); // Re-fetch accounts
    } catch (error) {
      console.error("Failed to update nickname:", error);
      showToast("Failed to update nickname. Please try again.", {
        type: "error",
      });
    }
  };

  // Handle user role update
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!selectedAccount) return;

    // Find the user to get their email
    const user = selectedAccount.users.find((u) => u.id === userId);
    if (!user) return;

    // Set pending role change and open confirmation modal
    setPendingRoleChange({ userId, newRole, userEmail: user.email });
    setIsRoleChangeModalOpen(true);
  };

  // Handle confirmed role update
  const handleConfirmedRoleUpdate = async () => {
    if (!selectedAccount || !pendingRoleChange) return;

    try {
      await updateUserRole(
        selectedAccount.id,
        pendingRoleChange.userId,
        pendingRoleChange.newRole,
      );
      mutate(); // Re-fetch accounts
      showToast("User role updated successfully!", { type: "success" });
    } catch (error) {
      console.error("Failed to update user role:", error);
      showToast("Failed to update user role. Please try again later.", {
        type: "error",
      });
    } finally {
      setIsRoleChangeModalOpen(false);
      setPendingRoleChange(null);
    }
  };

  // Handle resend invite
  const handleResendInvite = async (invitationId: string) => {
    if (!selectedAccount) return;

    try {
      await resendInvite(invitationId);
      mutate(); // Re-fetch accounts
      showToast("Invitation resent successfully!", { type: "success" });
    } catch (error) {
      console.error("Failed to resend invite:", error);
      showToast("Failed to resend invitation. Please try again later.", {
        type: "error",
      });
    }
  };

  // Handle delete invitation
  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      await deleteInvitation(invitationId);
      mutate(); // Re-fetch accounts
      showToast("Invitation deleted successfully!", { type: "success" });
    } catch (error) {
      console.error("Failed to delete invitation:", error);
      showToast("Failed to delete invitation. Please try again later.", {
        type: "error",
      });
    }
  };

  // Handle create account
  const handleCreateAccount = async (
    name: string,
    description: string | null,
  ) => {
    try {
      await createAccount(name, description);
      setIsCreateModalOpen(false);
      mutate(); // Re-fetch accounts
      showToast("Account created successfully!", { type: "success" });
    } catch (error) {
      console.error("Failed to create account:", error);
      showToast("Failed to create account. Please try again later.", {
        type: "error",
      });
    }
  };

  // Restore the handleRemoveUser function for removing users
  const handleRemoveUser = async (userId: string) => {
    if (!selectedAccount) return;
    try {
      await removeUser(selectedAccount.id, userId);
      mutate(); // Re-fetch accounts
      showToast("User removed successfully!", { type: "success" });
    } catch (error) {
      console.error("Failed to remove user:", error);
      showToast("Failed to remove user. Please try again later.", {
        type: "error",
      });
    }
  };

  // Add handler to set default account
  const handleSetDefaultAccount = async (accountId: string) => {
    try {
      await updateDefault(accountId);
      showToast("Default account set!", { type: "success" });
    } catch {
      showToast("Failed to set default account.", { type: "error" });
    }
  };

  // Show toast if inviteAccepted param is present
  useEffect(() => {
    if (
      searchParams.get("inviteAccepted") === "1" &&
      !hasShownInviteToast.current
    ) {
      showToast("Invitation accepted! You have joined the account.", {
        type: "success",
      });
      hasShownInviteToast.current = true;
    }
  }, [searchParams, showToast]);

  return (
    <div>
      {/* Main content grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left column: Account list */}
        <div className="lg:col-span-1">
          <AccountList
            accounts={accounts}
            selectedAccount={selectedAccount}
            onAccountSelect={handleAccountClick}
            onCreateAccount={() => setIsCreateModalOpen(true)}
            isLoading={isLoading}
          />
        </div>

        {/* Right column: Account details or placeholder */}
        <div className="lg:col-span-2">
          {selectedAccount ? (
            <AccountDetails
              account={selectedAccount}
              onEditNickname={() => isOwner && setIsEditModalOpen(true)}
              onInviteUser={() => isOwner && setIsInviteModalOpen(true)}
              onRemoveUser={(userId) => handleRemoveUser(userId)}
              onDeleteInvitation={(invitationId) =>
                handleDeleteInvitation(invitationId)
              }
              onUpdateUserRole={(userId, newRole) =>
                handleUpdateUserRole(userId, newRole)
              }
              onResendInvite={(invitationId) =>
                handleResendInvite(invitationId)
              }
              isOwner={isOwner}
              isDefault={defaultAccountId === selectedAccount.id}
              isLoadingDefault={isLoadingDefault}
              onSetDefault={() => handleSetDefaultAccount(selectedAccount.id)}
            />
          ) : (
            <Card>
              <div className="p-4 text-center text-gray-500">
                {isLoading
                  ? "Loading accounts..."
                  : "Select an account to view details"}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal for inviting new users */}
      <InviteUserModal
        isOpen={isInviteModalOpen && isOwner}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteUser}
        email={inviteEmail}
        onEmailChange={setInviteEmail}
        isLoading={isInviteLoading}
      />

      {/* Modal for editing account nickname */}
      <EditNicknameModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateNickname}
        nickname={selectedAccount?.nickname || ""}
      />

      {/* Modal for creating a new account */}
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateAccount}
      />

      {/* Role change confirmation modal */}
      <ChangeRoleConfirmationModal
        isOpen={isRoleChangeModalOpen}
        onClose={() => {
          setIsRoleChangeModalOpen(false);
          setPendingRoleChange(null);
        }}
        onConfirm={handleConfirmedRoleUpdate}
        newRole={pendingRoleChange?.newRole as "owner" | "member"}
        userEmail={pendingRoleChange?.userEmail || ""}
      />
    </div>
  );
}

export default AccountPageContent;
