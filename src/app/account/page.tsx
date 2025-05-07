"use client";

import useAccountStore, { Account } from "@/stores/accountStore";
import { useEffect, useState } from "react";

import Card from "@/components/Card";
import { mockAccounts } from "@/data/mockAccounts";
import AccountDetails from "./components/AccountDetails";
import AccountList from "./components/AccountList";
import EditNicknameModal from "./components/EditNicknameModal";
import InviteUserModal from "./components/InviteUserModal";

/**
 * AccountPage Component
 *
 * A page component that manages and displays account information and user management functionality.
 * It provides a split view with an account list on the left and detailed account information on the right.
 *
 * Features:
 * - Display and selection of multiple accounts
 * - Account nickname management
 * - User invitation system
 * - User role management
 * - User removal functionality
 * - Invite resending capability
 */

export default function AccountPage() {
  // State management using custom store
  const {
    accounts,
    selectedAccount,
    isInviteModalOpen,
    isEditModalOpen,
    setAccounts,
    setSelectedAccount,
    setIsInviteModalOpen,
    setIsEditModalOpen,
    updateAccountNickname,
    inviteUser,
    removeUser,
    updateUserRole,
    resendInvite,
  } = useAccountStore();

  // Local state for form inputs
  const [inviteEmail, setInviteEmail] = useState("");
  const [editingNickname, setEditingNickname] = useState("");

  // Initialize accounts with mock data on component mount
  useEffect(() => {
    setAccounts(mockAccounts);
  }, [setAccounts]);

  /**
   * Handles account selection and updates the editing nickname
   * @param account - The selected account object
   */
  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
    setEditingNickname(account.nickname);
  };

  /**
   * Handles user invitation process
   * Sends invite and resets form state
   */
  const handleInviteUser = async () => {
    if (!selectedAccount || !inviteEmail) return;
    await inviteUser(selectedAccount.id, inviteEmail);
    setInviteEmail("");
    setIsInviteModalOpen(false);
  };

  /**
   * Updates the account nickname and closes the edit modal
   */
  const handleUpdateNickname = () => {
    if (!selectedAccount) return;
    updateAccountNickname(selectedAccount.id, editingNickname);
    setIsEditModalOpen(false);
  };

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
          />
        </div>

        {/* Right column: Account details or placeholder */}
        <div className="lg:col-span-2">
          {selectedAccount ? (
            <AccountDetails
              account={selectedAccount}
              onEditNickname={() => setIsEditModalOpen(true)}
              onInviteUser={() => setIsInviteModalOpen(true)}
              onRemoveUser={(userId) => removeUser(selectedAccount.id, userId)}
              onUpdateUserRole={(userId, role) =>
                updateUserRole(selectedAccount.id, userId, role)
              }
              onResendInvite={(userId) =>
                resendInvite(selectedAccount.id, userId)
              }
            />
          ) : (
            <Card>
              <div className="p-4 text-center text-gray-500">
                Select an account to view details
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal for inviting new users */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteUser}
        email={inviteEmail}
        onEmailChange={setInviteEmail}
      />

      {/* Modal for editing account nickname */}
      <EditNicknameModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateNickname}
        nickname={editingNickname}
        onNicknameChange={setEditingNickname}
      />
    </div>
  );
}
