import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";
import { Debt } from "@/types/debt";
import { DebtFormData } from "@/lib/schemas/debt";
import DebtForm from "./DebtForm";

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<DebtFormData, "balance" | "interestRate"> & {
      balance: number;
      interestRate: number;
    },
  ) => void;
  editingDebt: Debt | null;
  isLoading?: boolean;
}

/**
 * Modal component for adding or editing a recurring debt.
 * Provides a form interface for creating new recurring debts or modifying existing ones.
 * Uses react-hook-form with Zod validation for form handling.
 */
export default function AddEditModal({
  isOpen,
  onClose,
  onSubmit,
  editingDebt,
  isLoading = false,
}: AddEditModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDebt ? "Edit Recurring" : "Add New Recurring"}
      maxWidth="md"
      footerButtons={
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="debt-form"
            variant="primary"
            size="sm"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {editingDebt ? "Save Changes" : "Add"}
          </Button>
        </div>
      }
    >
      <DebtForm
        debt={editingDebt || undefined}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
