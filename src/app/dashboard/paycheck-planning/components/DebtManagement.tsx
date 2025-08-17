import { useState, useEffect, useCallback } from "react";
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
import DebtModal from "@/components/DebtModal";

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

export default function DebtManagement({
  budgetAccountId,
  onDebtUpdate,
}: DebtManagementProps) {
  const { showToast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);

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
    setIsAddModalOpen(true);
  };

  const handleCancelAdd = () => {
    setIsAddModalOpen(false);
    setError(null);
  };

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
  };

  const handleDeleteDebt = (debt: Debt) => {
    setDeletingDebt(debt);
  };

  const handleSubmitNewDebt = async (data: {
    name: string;
    categoryId?: string;
    paymentAmount: number;
    interestRate: number;
    dueDate: string;
    hasBalance: boolean;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      await createDebt({
        name: data.name,
        paymentAmount: data.paymentAmount,
        interestRate: data.interestRate,
        dueDate: data.dueDate,
        hasBalance: data.hasBalance,
        categoryId: data.categoryId || undefined,
      });

      setIsAddModalOpen(false);
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

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
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

      {/* Add Debt Modal */}
      <DebtModal
        isOpen={isAddModalOpen}
        onClose={handleCancelAdd}
        budgetAccountId={budgetAccountId}
        onSubmit={handleSubmitNewDebt}
        isLoading={isLoading}
        title="Add New Debt"
      />

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
