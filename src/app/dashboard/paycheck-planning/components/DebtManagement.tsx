import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { useToast } from "@/components/Toast";
import { createDebt, getDebts, type Debt } from "@/app/actions/debt";

import EditDebtModal from "./EditDebtModal";
import DeleteDebtModal from "./DeleteDebtModal";

/**
 * Format a date string (YYYY-MM-DD) to display format (MMM dd)
 * without timezone conversion
 */
function formatDateString(dateString: string): string {
  const [, month, day] = dateString.split("-").map(Number);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[month - 1]} ${day.toString().padStart(2, "0")}`;
}

interface DebtManagementProps {
  budgetAccountId: string;
  onDebtUpdate: () => void;
}

interface DebtFormData {
  name: string;
  amount: number;
  dueDate: string;
  isRecurring: boolean;
  frequency?: string;
  description?: string;
  hasBalance?: boolean;
}

export default function DebtManagement({
  budgetAccountId,
  onDebtUpdate,
}: DebtManagementProps) {
  const { showToast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DebtFormData>({
    defaultValues: {
      isRecurring: true,
      frequency: "monthly",
    },
  });

  const isRecurring = watch("isRecurring");

  // Fetch debts function
  const fetchDebts = useCallback(async () => {
    try {
      const fetchedDebts = await getDebts(budgetAccountId);
      setDebts(fetchedDebts);
    } catch (error) {
      console.error("Failed to fetch debts:", error);
      setError("Failed to load debts");
    }
  }, [budgetAccountId]);

  // Fetch debts on component mount
  useEffect(() => {
    if (budgetAccountId) {
      fetchDebts();
    }
  }, [budgetAccountId, fetchDebts]);

  // Sort debts by due date (comparing date strings directly)
  const sortedDebts = [...debts].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate),
  );

  const handleAddDebt = () => {
    setIsAddFormVisible(true);
  };

  const handleCancelAdd = () => {
    setIsAddFormVisible(false);
    reset();
    setError(null);
  };

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
  };

  const handleDeleteDebt = (debt: Debt) => {
    setDeletingDebt(debt);
  };

  const onSubmit = async (data: DebtFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (data.isRecurring) {
        // For now, create as one-time debt with note about being recurring
        // In a full implementation, you'd want to create a proper recurring transaction
        await createDebt({
          name: `${data.name} (${data.frequency || "monthly"})`,
          paymentAmount: data.amount,
          interestRate: 0,
          dueDate: data.dueDate,
          hasBalance: data.hasBalance || false,
        });
      } else {
        // Create as one-time debt
        await createDebt({
          name: data.name,
          paymentAmount: data.amount,
          interestRate: 0, // Default to 0 for bills/payments
          dueDate: data.dueDate,
          hasBalance: data.hasBalance || false,
        });
      }

      reset();
      setIsAddFormVisible(false);
      await fetchDebts(); // Refetch debts after creation
      onDebtUpdate();
      showToast("The debt has been added successfully.", { type: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add debt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebtUpdated = async () => {
    setEditingDebt(null);
    await fetchDebts(); // Refetch debts after update
    onDebtUpdate();
    showToast("The debt has been updated successfully.", { type: "success" });
  };

  const handleDebtDeleted = async () => {
    setDeletingDebt(null);
    await fetchDebts(); // Refetch debts after delete
    onDebtUpdate();
    showToast("The debt has been deleted successfully.", { type: "success" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Debt Payments
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddDebt}
          className="flex items-center space-x-2 w-full sm:w-auto"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Debt</span>
        </Button>
      </div>

      {/* Add Debt Form */}
      {isAddFormVisible && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-4"
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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
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

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelAdd}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                Add Debt
              </Button>
            </div>
          </form>
        </Card>
      )}

      {sortedDebts.length === 0 ? (
        <Card>
          <div className="text-center py-6 sm:py-8">
            <CurrencyDollarIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No Debts Found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Add recurring debts and bills to see how they fit with your
              paychecks.
            </p>
            <Button
              variant="primary"
              onClick={handleAddDebt}
              className="w-full sm:w-auto"
            >
              Add Your First Debt
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedDebts.map((debt) => (
            <Card key={debt.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gray-100 flex-shrink-0">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {debt.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="h-4 w-4" />
                          <span>Due {formatDateString(debt.dueDate)}</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <span className="capitalize">One-time</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="text-left sm:text-right">
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      ${debt.paymentAmount.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditDebt(debt)}
                      className="flex items-center"
                      aria-label={`Edit ${debt.name}`}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDebt(debt)}
                      className="flex items-center text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      aria-label={`Delete ${debt.name}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {editingDebt && (
        <EditDebtModal
          isOpen={!!editingDebt}
          onClose={() => setEditingDebt(null)}
          onDebtUpdated={handleDebtUpdated}
          debt={editingDebt}
          budgetAccountId={budgetAccountId}
        />
      )}

      {deletingDebt && (
        <DeleteDebtModal
          isOpen={!!deletingDebt}
          onClose={() => setDeletingDebt(null)}
          onDebtDeleted={handleDebtDeleted}
          debt={deletingDebt}
        />
      )}
    </div>
  );
}
