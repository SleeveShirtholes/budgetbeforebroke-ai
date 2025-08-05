import { useState } from "react";
import { format } from "date-fns";
import { PlusIcon, PencilIcon, TrashIcon, CalendarDaysIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { useToast } from "@/components/Toast";
import type { DebtInfo } from "@/app/actions/paycheck-planning";

import AddDebtModal from "./AddDebtModal";
import EditDebtModal from "./EditDebtModal";
import DeleteDebtModal from "./DeleteDebtModal";

interface DebtManagementProps {
  debts: DebtInfo[];
  budgetAccountId: string;
  onDebtUpdate: () => void;
}

export default function DebtManagement({
  debts,
  budgetAccountId,
  onDebtUpdate,
}: DebtManagementProps) {
  const { showToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtInfo | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<DebtInfo | null>(null);

  // Sort debts by due date
  const sortedDebts = [...debts].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const handleAddDebt = () => {
    setIsAddModalOpen(true);
  };

  const handleEditDebt = (debt: DebtInfo) => {
    setEditingDebt(debt);
  };

  const handleDeleteDebt = (debt: DebtInfo) => {
    setDeletingDebt(debt);
  };

  const handleDebtAdded = () => {
    setIsAddModalOpen(false);
    onDebtUpdate();
    showToast("The debt has been added successfully.", { type: "success" });
  };

  const handleDebtUpdated = () => {
    setEditingDebt(null);
    onDebtUpdate();
    showToast("The debt has been updated successfully.", { type: "success" });
  };

  const handleDebtDeleted = () => {
    setDeletingDebt(null);
    onDebtUpdate();
    showToast("The debt has been deleted successfully.", { type: "success" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Debt Payments
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddDebt}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Debt</span>
        </Button>
      </div>

      {sortedDebts.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Debts Found
            </h3>
            <p className="text-gray-600 mb-4">
              Add recurring debts and bills to see how they fit with your paychecks.
            </p>
            <Button variant="primary" onClick={handleAddDebt}>
              Add Your First Debt
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedDebts.map((debt) => (
            <Card key={debt.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      debt.isRecurring ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <CurrencyDollarIcon className={`h-5 w-5 ${
                        debt.isRecurring ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {debt.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="h-4 w-4" />
                          <span>Due {format(debt.dueDate, 'MMM dd')}</span>
                        </div>
                        <span>•</span>
                        <span className="capitalize">
                          {debt.isRecurring ? debt.frequency : 'One-time'}
                        </span>
                        {debt.description && debt.description !== debt.name && (
                          <>
                            <span>•</span>
                            <span className="text-gray-500">{debt.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ${debt.amount.toLocaleString()}
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

      {/* Summary */}
      {sortedDebts.length > 0 && (
        <Card variant="filled">
          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <p className="text-gray-600">
                {sortedDebts.filter(d => d.isRecurring).length} recurring, {sortedDebts.filter(d => !d.isRecurring).length} one-time
              </p>
              <p className="text-gray-600">
                Next payment due: {format(sortedDebts[0]?.dueDate, 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                ${sortedDebts.reduce((sum, debt) => sum + debt.amount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total this month</p>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <AddDebtModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onDebtAdded={handleDebtAdded}
        budgetAccountId={budgetAccountId}
      />

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