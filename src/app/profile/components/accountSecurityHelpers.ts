// Helper types and functions for AccountSecurity

import { Passkey } from "@/lib/auth-types";
import { useToast } from "@/components/Toast";

/**
 * Utility type for API responses that may contain an error.
 */
export type APIResult = { error?: string | { message?: string } | null };

/**
 * Type alias for the showToast function from the useToast hook.
 */
export type AccountSecurityShowToast = ReturnType<typeof useToast>["showToast"];

/**
 * Handles deleting a passkey for the user.
 * Extracted for clarity and maintainability.
 */
export async function handleDeletePasskeyFn(
  passkeyToDelete: Passkey | null,
  showToast: AccountSecurityShowToast,
  mutatePasskeys: () => Promise<unknown>,
  setIsDeletePasskeyModalOpen: (open: boolean) => void,
  setPasskeyToDelete: (passkey: Passkey | null) => void,
  authClient: typeof import("@/lib/auth-client").authClient,
) {
  if (!passkeyToDelete) {
    showToast("No passkey selected", { type: "error" });
    return;
  }

  try {
    const result: APIResult = await authClient.passkey.deletePasskey({
      id: passkeyToDelete.id,
    });
    if (result && result.error) {
      showToast(
        typeof result.error === "string"
          ? result.error
          : (result.error as { message?: string })?.message ||
              "Failed to delete passkey",
        { type: "error" },
      );
      return;
    }
    showToast("Passkey deleted successfully", { type: "success" });
    await mutatePasskeys();
    setIsDeletePasskeyModalOpen(false);
    setPasskeyToDelete(null);
  } catch (error) {
    console.error("Error deleting passkey:", error);
    showToast("Failed to delete passkey", { type: "error" });
  }
}
