import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";
import { updateDebt, type Debt } from "@/app/actions/debt";

interface EditDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDebtUpdated: () => void;
  debt: Debt;
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
    if (debt && debt.dueDate) {
      try {
        // Use the date string directly since we're storing dates as YYYY-MM-DD
        reset({
          name: debt.name || "",
          amount: debt.paymentAmount || 0,
          dueDate: debt.dueDate, // Use the string directly
          description: debt.name || "",
        });
      } catch (error) {
        console.error("Error formatting debt data:", error);
        setError("Invalid debt data format");
      }
    }
  }, [debt, reset]);

  // Safety check - if debt is invalid, don't render the modal
  if (!debt) {
    console.error("EditDebtModal: No debt provided");
    return null;
  }

  if (!debt.dueDate) {
    console.error("EditDebtModal: Debt missing dueDate", debt);
    return null;
  }

  const onSubmit = async (data: DebtFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update debt
      await updateDebt({
        id: debt.id,
        name: data.name,
        paymentAmount: parseFloat(data.amount.toString()),
        interestRate: 0, // Keep existing interest rate or default to 0
        dueDate: data.dueDate,
      });

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
            type="submit"
            form="edit-debt-form"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            Update Debt
          </Button>
        </div>
      }
    >
      <form
        id="edit-debt-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name *
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., Rent, Credit Card, Utilities"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                {...register("amount", {
                  required: "Amount is required",
                  min: {
                    value: 0.01,
                    message: "Amount must be greater than 0",
                  },
                })}
                type="number"
                step="0.01"
                id="amount"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due Date *
            </label>
            <input
              {...register("dueDate", { required: "Due date is required" })}
              type="date"
              id="dueDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.dueDate.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (Optional)
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Additional notes about this payment..."
          />
        </div>
      </form>
    </Modal>
  );
}
