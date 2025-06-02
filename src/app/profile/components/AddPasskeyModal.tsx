import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import Modal from "@/components/Modal";
import { useState } from "react";

interface AddPasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
  isLoading: boolean;
}

/**
 * Modal for adding a new passkey
 */
export default function AddPasskeyModal({
  isOpen,
  onClose,
  onAdd,
  isLoading,
}: AddPasskeyModalProps) {
  const [passkeyName, setPasskeyName] = useState("");

  const handleClose = () => {
    setPasskeyName("");
    onClose();
  };

  const handleAdd = async () => {
    await onAdd(passkeyName);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Passkey"
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
            onClick={handleAdd}
            variant="primary"
            size="sm"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Adding..." : "Add Passkey"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Add a new passkey to your account. You&apos;ll be prompted to use your
          device&apos;s biometric or PIN.
        </p>
        <TextField
          label="Passkey Name (Optional)"
          type="text"
          id="passkey-name"
          value={passkeyName}
          onChange={(e) => setPasskeyName(e.target.value)}
          placeholder="e.g., iPhone 13, MacBook Pro"
        />
      </div>
    </Modal>
  );
}
