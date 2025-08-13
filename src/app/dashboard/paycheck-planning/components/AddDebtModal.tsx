import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";
import { createDebt } from "@/app/actions/debt";

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDebtAdded: () => void;
  budgetAccountId: string;
}

interface DebtFormData {
  name: string;
  amount: string;
  dueDate: string;
  isRecurring: boolean;
  frequency?: string;
  description?: string;
}

export default function AddDebtModal({
  isOpen,
  onClose,
  onDebtAdded,
}: AddDebtModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DebtFormData>({
    defaultValues: {
      name: "",
      amount: "",
      dueDate: "",
      isRecurring: true,
      frequency: "monthly",
      description: "",
    },
  });

  const isRecurring = watch("isRecurring");

  const onSubmit = async (data: DebtFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const amount = parseFloat(data.amount) || 0;

      if (data.isRecurring) {
        // For now, create as one-time debt with note about being recurring
        // In a full implementation, you'd want to create a proper recurring transaction
        await createDebt({
          name: `${data.name} (${data.frequency || "monthly"})`,
          paymentAmount: amount,
          interestRate: 0,
          dueDate: data.dueDate,
          hasBalance: false,
        });
      } else {
        // Create as one-time debt
        await createDebt({
          name: data.name,
          paymentAmount: amount,
          interestRate: 0, // Default to 0 for bills/payments
          dueDate: data.dueDate,
          hasBalance: false,
        });
      }

      resetForm();
      onDebtAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add debt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setError(null);
    onClose();
  };

  const resetForm = () => {
    reset({
      name: "",
      amount: "",
      dueDate: "",
      isRecurring: true,
      frequency: "monthly",
      description: "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Debt/Bill"
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
            form="add-debt-form"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            Add Debt
          </Button>
        </div>
      }
    >
      <form
        id="add-debt-form"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message:
                      "Please enter a valid amount (e.g., 100 or 100.50)",
                  },
                  validate: (value) => {
                    const num = parseFloat(value);
                    if (isNaN(num) || num <= 0) {
                      return "Amount must be greater than 0";
                    }
                    return true;
                  },
                })}
                type="text"
                id="amount"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.amount.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  {...register("isRecurring")}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Recurring payment
                </span>
              </label>
            </div>
          </div>
        </div>

        {isRecurring && (
          <div>
            <label
              htmlFor="frequency"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Frequency
            </label>
            <select
              {...register("frequency")}
              id="frequency"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

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
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Additional notes about this payment..."
          />
        </div>
      </form>
    </Modal>
  );
}
