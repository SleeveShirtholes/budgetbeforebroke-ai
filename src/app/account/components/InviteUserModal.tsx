import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import Modal from "@/components/Modal";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: () => void;
  email: string;
  onEmailChange: (email: string) => void;
}

/**
 * InviteUserModal Component
 *
 * A modal dialog that allows users to invite new members to an account by email.
 * Provides a form with email input and actions to send the invitation or cancel.
 *
 * @param {boolean} isOpen - Controls the visibility of the modal
 * @param {() => void} onClose - Callback function to close the modal
 * @param {() => void} onInvite - Callback function to send the invitation
 * @param {string} email - The email address to send the invitation to
 * @param {(email: string) => void} onEmailChange - Callback function when email input changes
 */
export default function InviteUserModal({
  isOpen,
  onClose,
  onInvite,
  email,
  onEmailChange,
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
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onInvite}>
            Send Invitation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
