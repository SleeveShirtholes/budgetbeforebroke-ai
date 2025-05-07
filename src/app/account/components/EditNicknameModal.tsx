import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import Modal from "@/components/Modal";

interface EditNicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  nickname: string;
  onNicknameChange: (nickname: string) => void;
}

/**
 * EditNicknameModal Component
 *
 * A modal dialog that allows users to edit the nickname of an account.
 * Provides a form with nickname input and actions to save changes or cancel.
 *
 * @param {boolean} isOpen - Controls the visibility of the modal
 * @param {() => void} onClose - Callback function to close the modal
 * @param {() => void} onSave - Callback function to save the new nickname
 * @param {string} nickname - The current nickname value
 * @param {(nickname: string) => void} onNicknameChange - Callback function when nickname input changes
 */
export default function EditNicknameModal({
  isOpen,
  onClose,
  onSave,
  nickname,
  onNicknameChange,
}: EditNicknameModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Account Nickname"
      maxWidth="sm"
    >
      <div className="p-4">
        <div className="mb-4">
          <TextField
            label="Account Nickname"
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            placeholder="Enter account nickname"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
