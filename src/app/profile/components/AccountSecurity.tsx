"use client";

import { APIResult, handleDeletePasskeyFn } from "./accountSecurityHelpers";
// Import helpers for AccountSecurity
import {
  getAccountInfo,
  getCurrentUserPasskeys,
  setPasswordAction,
  updatePasswordTimestamp,
} from "../actions";

import ChangePasswordModal from "./ChangePasswordModal";
import DeletePasskeyModal from "./DeletePasskeyModal";
import { Passkey } from "@/lib/auth-types";
import { authClient } from "@/lib/auth-client";
import { formatDateSafely } from "@/utils/date";
import useSWR from "swr";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { validatePasswordChange } from "@/app/profile/actions";

/**
 * AccountSecurity Component
 *
 * Manages user's security settings including:
 * - Passkey management (add/delete)
 * - Password change (create/change)
 */
const AccountSecurity = () => {
  const { showToast } = useToast();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isDeletePasskeyModalOpen, setIsDeletePasskeyModalOpen] =
    useState(false);
  const [passkeyToDelete, setPasskeyToDelete] = useState<Passkey | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch passkey data
  const { data: passkeys, mutate: mutatePasskeys } = useSWR<Passkey[]>(
    "passkeys",
    getCurrentUserPasskeys,
  );

  // Fetch account data
  const { data: account, mutate: mutateAccount } = useSWR(
    "account",
    getAccountInfo,
  );

  /**
   * Handles changing or creating a password for the user.
   * Uses the correct method based on whether the user already has a password.
   */
  const handleChangePassword = async (
    currentPassword: string | null,
    newPassword: string,
  ) => {
    setPasswordLoading(true);
    try {
      // First validate the current password if it exists
      const validationResult = await validatePasswordChange();

      if (!validationResult.success) {
        showToast(
          validationResult.error || "Failed to validate password change",
          { type: "error" },
        );
        return;
      }

      if (validationResult.hasExistingPassword) {
        // User already has a password, so use changePassword
        const result: APIResult = await authClient.changePassword({
          currentPassword: currentPassword!,
          newPassword,
        });

        if (result && result.error) {
          showToast(
            typeof result.error === "string"
              ? result.error
              : (result.error as { message?: string })?.message ||
                  "Failed to change password",
            { type: "error" },
          );
          return;
        }

        await updatePasswordTimestamp();

        showToast("Password changed successfully", { type: "success" });
        setIsChangePasswordModalOpen(false);
        await mutateAccount();
      } else {
        // User does not have a password, so use setPasswordAction
        const result: APIResult = await setPasswordAction(newPassword);
        if (result && result.error) {
          showToast(
            typeof result.error === "string"
              ? result.error
              : (result.error as { message?: string })?.message ||
                  "Failed to set password",
            { type: "error" },
          );
          return;
        }

        showToast("Password set successfully", { type: "success" });
        setIsChangePasswordModalOpen(false);
        await mutateAccount();
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showToast("An unexpected error occurred", { type: "error" });
    } finally {
      setPasswordLoading(false);
    }
  };

  /**
   * Handles deleting a passkey by delegating to the extracted function.
   */
  const handleDeletePasskey = async () => {
    await handleDeletePasskeyFn(
      passkeyToDelete,
      showToast,
      mutatePasskeys,
      setIsDeletePasskeyModalOpen,
      setPasskeyToDelete,
      authClient,
    );
  };

  return (
    <div className="space-y-4">
      {/* Passkey List */}
      {!passkeys && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Your Passkeys
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {passkeys
                  ? "Manage your registered passkeys for secure sign-in"
                  : "Loading passkeys..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {passkeys && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Your Passkeys
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {passkeys.length > 0
                  ? "Manage your registered passkeys for secure sign-in"
                  : "Add a passkey for quick and secure sign-in"}
              </p>
            </div>
          </div>
          {passkeys.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {passkey.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {passkey.deviceType} • Added{" "}
                      {passkey.createdAt
                        ? formatDateSafely(
                            passkey.createdAt.toISOString(),
                            "MMM dd, yyyy",
                          )
                        : "Unknown"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPasskeyToDelete(passkey);
                      setIsDeletePasskeyModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>Delete</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-center">
              <p className="text-sm text-gray-500">No passkeys found</p>
            </div>
          )}
        </div>
      )}

      {/* Password Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-secondary-900">
              {account?.hasPassword ? "Change Password" : "Create Password"}
            </p>
            <p className="text-sm text-secondary-600">
              {account?.hasPassword
                ? account.passwordLastChanged
                  ? `Last changed: ${formatDateSafely(account.passwordLastChanged.toISOString(), "MMM dd, yyyy")}`
                  : "Last changed: Unknown"
                : "Add a password to your account for additional security"}
            </p>
          </div>
          <button
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {account?.hasPassword ? "Change" : "Create"}
          </button>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onChangePassword={handleChangePassword}
        isLoading={passwordLoading}
        hasPassword={account?.hasPassword ?? false}
      />

      <DeletePasskeyModal
        isOpen={isDeletePasskeyModalOpen}
        onClose={() => {
          setIsDeletePasskeyModalOpen(false);
          setPasskeyToDelete(null);
        }}
        onDelete={handleDeletePasskey}
        passkey={passkeyToDelete}
      />
    </div>
  );
};

export default AccountSecurity;
