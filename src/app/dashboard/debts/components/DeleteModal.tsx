import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Confirmation modal for deleting a debt.
 * Warns users about the permanent nature of the deletion and its impact on payment history.
 * Provides cancel and confirm actions for the deletion process.
 */
export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Debt"
      maxWidth="sm"
      footerButtons={
        <div className="flex gap-2">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            variant="danger"
            size="sm"
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete this debt? This action cannot be
          undone.
        </p>
        <p className="text-sm text-gray-500">
          All payment history associated with this debt will be permanently
          removed.
        </p>
      </div>
    </Modal>
  );
}
