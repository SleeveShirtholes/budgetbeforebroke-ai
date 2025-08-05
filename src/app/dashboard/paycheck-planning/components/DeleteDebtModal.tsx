import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";
import { deleteDebt } from "@/app/actions/debt";
import type { DebtInfo } from "@/app/actions/paycheck-planning";

interface DeleteDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDebtDeleted: () => void;
  debt: DebtInfo;
}

export default function DeleteDebtModal({
  isOpen,
  onClose,
  onDebtDeleted,
  debt,
}: DeleteDebtModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!debt.isRecurring) {
        await deleteDebt(debt.id);
        onDebtDeleted();
      } else {
        // For recurring transactions, we'd need a different delete function
        throw new Error("Recurring debts must be deleted from the Recurring Transactions page");
      }
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
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            variant="danger"
            size="sm"
            isLoading={isLoading}
            disabled={debt.isRecurring}
          >
            Delete Debt
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {debt.isRecurring ? (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Recurring Payment
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  This is a recurring payment. To delete recurring payments, please use the Recurring Transactions page.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                Are you sure you want to delete this debt?
              </h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-600">
                  You are about to delete:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{debt.name}</p>
                  <p className="text-sm text-gray-600">
                    Amount: ${debt.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Due: {debt.dueDate.toLocaleDateString()}
                  </p>
                  {debt.description && debt.description !== debt.name && (
                    <p className="text-sm text-gray-600">
                      Description: {debt.description}
                    </p>
                  )}
                </div>
                <p className="text-sm text-red-600 font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}