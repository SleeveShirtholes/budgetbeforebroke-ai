import Button from "@/components/Button";
import Modal from "@/components/Modal";
import TextField from "@/components/Forms/TextField";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: () => Promise<void>;
  email: string;
  onEmailChange: (email: string) => void;
  isLoading?: boolean;
}

/**
 * InviteUserModal Component
 *
 * A modal dialog that allows users to invite new members to an account by email.
 * Provides a form with email input and actions to send the invitation or cancel.
 *
 * @param {boolean} isOpen - Controls the visibility of the modal
 * @param {() => void} onClose - Callback function to close the modal
 * @param {() => Promise<void>} onInvite - Callback function to send the invitation
 * @param {string} email - The email address to send the invitation to
 * @param {(email: string) => void} onEmailChange - Callback function when email input changes
 * @param {boolean} isLoading - Controls the loading state of the Send Invitation button
 */
export default function InviteUserModal({
  isOpen,
  onClose,
  onInvite,
  email,
  onEmailChange,
  isLoading = false,
}: InviteUserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite User" maxWidth="sm">
      <div className="p-4">
        <div className="mb-4">
          <TextField
            label="Email Address"
            type="email"
            id="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Enter email address"
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onInvite} isLoading={isLoading}>
            Send Invitation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
