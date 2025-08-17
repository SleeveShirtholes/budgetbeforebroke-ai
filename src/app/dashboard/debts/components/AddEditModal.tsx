import { Debt } from "@/types/debt";
import { DebtFormData } from "@/lib/schemas/debt";
import DebtModal from "@/components/DebtModal";

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetAccountId: string;
  onSubmit: (
    data: Omit<DebtFormData, "paymentAmount" | "interestRate"> & {
      paymentAmount: number;
      interestRate: number;
    },
  ) => void;
  editingDebt: Debt | null;
  isLoading?: boolean;
}

/**
 * Modal component for adding or editing a debt.
 * Provides a form interface for creating new debts or modifying existing ones.
 * Uses react-hook-form with Zod validation for form handling.
 */
export default function AddEditModal({
  isOpen,
  onClose,
  budgetAccountId,
  onSubmit,
  editingDebt,
  isLoading = false,
}: AddEditModalProps) {
  return (
    <DebtModal
      isOpen={isOpen}
      onClose={onClose}
      budgetAccountId={budgetAccountId}
      debt={editingDebt || undefined}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
}
