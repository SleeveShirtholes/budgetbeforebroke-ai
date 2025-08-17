import { useState } from "react";
import { updateDebt, type Debt } from "@/app/actions/debt";
import DebtModal from "@/components/DebtModal";

interface EditDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDebtUpdated: () => void;
  debt: Debt;
  budgetAccountId: string;
}

export default function EditDebtModal({
  isOpen,
  onClose,
  onDebtUpdated,
  debt,
  budgetAccountId,
}: EditDebtModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: {
    name: string;
    paymentAmount: number;
    interestRate: number;
    dueDate: string;
    categoryId?: string;
  }) => {
    setIsLoading(true);

    try {
      // Update debt
      await updateDebt({
        id: debt.id,
        name: data.name,
        paymentAmount: data.paymentAmount,
        interestRate: data.interestRate,
        dueDate: data.dueDate,
        categoryId: data.categoryId,
      });

      onDebtUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update debt:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DebtModal
      isOpen={isOpen}
      onClose={onClose}
      budgetAccountId={budgetAccountId}
      debt={debt}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title="Edit Debt/Bill"
    />
  );
}
