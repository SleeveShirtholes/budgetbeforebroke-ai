import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";
import { deleteDebt, type Debt } from "@/app/actions/debt";

interface DeleteDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDebtDeleted: () => void;
  debt: Debt;
  budgetAccountId: string;
}

export default function DeleteDebtModal({
  isOpen,
  onClose,
  onDebtDeleted,
  debt,
  budgetAccountId,
}: DeleteDebtModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteDebt(debt.id, budgetAccountId);
      onDebtDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete debt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Debt/Bill"
      maxWidth="md"
      footerButtons={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            variant="danger"
            size="sm"
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            Delete Debt
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Are you sure you want to delete &ldquo;{debt.name}&rdquo;? This
            action cannot be undone.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
