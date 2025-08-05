import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";
import { updateDebt } from "@/app/actions/debt";
import type { DebtInfo } from "@/app/actions/paycheck-planning";

interface EditDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDebtUpdated: () => void;
  debt: DebtInfo;
  budgetAccountId: string;
}

interface DebtFormData {
  name: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export default function EditDebtModal({
  isOpen,
  onClose,
  onDebtUpdated,
  debt,
}: EditDebtModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DebtFormData>();

  useEffect(() => {
    if (debt) {
      reset({
        name: debt.name,
        amount: debt.amount,
        dueDate: format(debt.dueDate, 'yyyy-MM-dd'),
        description: debt.description || "",
      });
    }
  }, [debt, reset]);

  const onSubmit = async (data: DebtFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!debt.isRecurring) {
        // Update one-time debt
        await updateDebt({
          id: debt.id,
          name: data.name,
          balance: data.amount,
          interestRate: 0, // Keep existing interest rate or default to 0
          dueDate: data.dueDate,
        });
      } else {
        // For recurring transactions, we'd need a different update function
        // For now, show a message that recurring debts can't be edited here
        throw new Error("Recurring debts must be edited from the Recurring Transactions page");
      }
      
      onDebtUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update debt");
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
      title="Edit Debt/Bill"
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
            type="submit"
            form="edit-debt-form"
            variant="primary"
            size="sm"
            isLoading={isLoading}
          >
            Update Debt
          </Button>
        </div>
      }
    >
      <form id="edit-debt-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {debt.isRecurring && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              This is a recurring payment. To edit recurring payments, please use the Recurring Transactions page.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            {...register("name", { required: "Name is required" })}
            type="text"
            id="name"
            disabled={debt.isRecurring}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="e.g., Rent, Credit Card, Utilities"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              {...register("amount", { 
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" }
              })}
              type="number"
              step="0.01"
              id="amount"
              disabled={debt.isRecurring}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date *
          </label>
          <input
            {...register("dueDate", { required: "Due date is required" })}
            type="date"
            id="dueDate"
            disabled={debt.isRecurring}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={3}
            disabled={debt.isRecurring}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Additional notes about this payment..."
          />
        </div>
      </form>
    </Modal>
  );
}