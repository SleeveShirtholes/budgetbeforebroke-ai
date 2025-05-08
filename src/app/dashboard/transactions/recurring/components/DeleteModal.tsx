import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation modal for deleting a recurring debt.
 * Warns users about the permanent nature of the deletion and its impact on payment history.
 * Provides cancel and confirm actions for the deletion process.
 */
export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Recurring"
      maxWidth="sm"
      footerButtons={
        <div className="flex gap-2">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} variant="danger" size="sm">
            Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete this recurring? This action cannot be
          undone.
        </p>
        <p className="text-sm text-gray-500">
          All payment history associated with this recurring will be permanently
          removed.
        </p>
      </div>
    </Modal>
  );
}
