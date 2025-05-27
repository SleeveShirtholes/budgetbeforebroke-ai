import Button from "@/components/Button";
import Modal from "@/components/Modal";
import PasswordField from "@/components/Forms/PasswordField";
import PasswordStrengthMeter from "@/components/Forms/PasswordStrengthMeter";
import { useState } from "react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (
    currentPassword: string | null,
    newPassword: string,
  ) => Promise<void>;
  isLoading: boolean;
  hasPassword: boolean;
}

/**
 * Modal for changing or creating the user's password
 */
export default function ChangePasswordModal({
  isOpen,
  onClose,
  onChangePassword,
  isLoading,
  hasPassword,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setPasswordTouched(false);
    setConfirmTouched(false);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate passwords
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      await onChangePassword(hasPassword ? currentPassword : null, newPassword);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={hasPassword ? "Change Password" : "Create Password"}
      maxWidth="sm"
      footerButtons={
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            variant="primary"
            size="sm"
            disabled={
              isLoading ||
              (hasPassword && !currentPassword) ||
              !newPassword ||
              !confirmPassword
            }
          >
            {isLoading
              ? hasPassword
                ? "Changing..."
                : "Creating..."
              : hasPassword
                ? "Change Password"
                : "Create Password"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {hasPassword && (
          <PasswordField
            label="Current Password"
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        )}
        <PasswordField
          label="New Password"
          id="new-password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setPasswordTouched(true);
          }}
          onBlur={() => setPasswordTouched(true)}
          required
          autoComplete="new-password"
        />
        <PasswordStrengthMeter
          password={newPassword}
          touched={passwordTouched}
          confirmPassword={confirmPassword}
          confirmTouched={confirmTouched}
        />
        <PasswordField
          label="Confirm New Password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmTouched(true);
          }}
          onBlur={() => setConfirmTouched(true)}
          required
          autoComplete="new-password"
        />
      </div>
    </Modal>
  );
}
