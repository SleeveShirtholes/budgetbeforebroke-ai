"use client";

import Button from "@/components/Button";
import Card from "@/components/Card";
import SearchInput from "@/components/Forms/SearchInput";
import { useToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import { Debt } from "@/types/debt";
import { DebtFormData, DebtPaymentFormData } from "@/lib/schemas/debt";
import { useDebts } from "@/hooks/useDebts";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";
import AddEditModal from "./components/AddEditModal";
import DebtCard from "./components/DebtCard";
import DeleteModal from "./components/DeleteModal";
import PayModal from "./components/PayModal";

/**
 * RecurringPage Component
 *
 * A page component that manages recurring debts and payments using SWR for data fetching
 * and server actions for database operations. It provides functionality to:
 * - View a list of recurring debts with their details
 * - Add new recurring debts
 * - Edit existing recurring debts
 * - Delete recurring debts
 * - Record payments against debts
 * - Search and filter debts
 *
 * The component uses SWR for data management and react-hook-form with Zod validation
 * for form handling. Each debt includes details like name, balance, interest rate, 
 * due date, and payment history.
 */
function RecurringPage() {
  // Get the selected budget account
  const { selectedAccount, isLoading: isAccountsLoading } = useBudgetAccount();

  // SWR hook for managing debt data
  const { 
    debts, 
    error, 
    isLoading, 
    addDebt, 
    updateDebtById, 
    removeDebt, 
    addPayment 
  } = useDebts(selectedAccount?.id);

  // State for managing modal interactions
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingDebtId, setPayingDebtId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  // Filter debts based on search query
  const filteredDebts = useMemo(() => {
    if (!debts) return [];
    
    return debts.filter((debt) => {
      const query = search.toLowerCase();
      return (
        debt.name.toLowerCase().includes(query) ||
        debt.balance.toString().includes(query) ||
        debt.interestRate.toString().includes(query) ||
        new Date(debt.dueDate).toLocaleDateString().toLowerCase().includes(query)
      );
    });
  }, [debts, search]);

  const openModal = (debt?: Debt) => {
    if (debt) {
      setEditingDebt(debt);
    } else {
      setEditingDebt(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDebt(null);
  };

  const handleSubmit = async (
    data: Omit<DebtFormData, 'balance' | 'interestRate'> & { balance: number; interestRate: number }
  ) => {
    if (!selectedAccount) {
      showToast("No budget account selected", { type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDebt) {
        const result = await updateDebtById({
          id: editingDebt.id,
          ...data,
        });
        if (result.success) {
          showToast("Debt updated successfully!", { type: "success" });
          closeModal();
        } else {
          showToast("Failed to update debt. Please try again.", { type: "error" });
        }
      } else {
        const result = await addDebt({
          ...data,
        });
        if (result.success) {
          showToast("Debt added successfully!", { type: "success" });
          closeModal();
        } else {
          showToast("Failed to add debt. Please try again.", { type: "error" });
        }
      }
    } catch (err) {
      console.error("Error saving debt:", err);
      showToast("Failed to save debt. Please try again.", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingDebtId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingDebtId || !selectedAccount) return;
    
    setIsSubmitting(true);
    try {
      const result = await removeDebt(deletingDebtId);
      if (result.success) {
        showToast("Debt deleted successfully!", { type: "success" });
        setDeleteModalOpen(false);
        setDeletingDebtId(null);
      } else {
        showToast("Failed to delete debt. Please try again.", { type: "error" });
      }
    } catch (err) {
      console.error("Error deleting debt:", err);
      showToast("Failed to delete debt. Please try again.", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeletingDebtId(null);
  };

  const openPayModal = (debtId: string) => {
    setPayingDebtId(debtId);
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    setPayModalOpen(false);
    setPayingDebtId(null);
  };

  const handlePaySubmit = async (data: DebtPaymentFormData) => {
    if (!payingDebtId || !selectedAccount) return;
    
    setIsSubmitting(true);
    try {
      const result = await addPayment({
        ...data,
        debtId: payingDebtId,
      });
      if (result.success) {
        showToast("Payment successful!", { type: "success" });
        closePayModal();
      } else {
        showToast("Failed to record payment. Please try again.", { type: "error" });
      }
    } catch (err) {
      console.error("Error recording payment:", err);
      showToast("Failed to record payment. Please try again.", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state for accounts
  if (isAccountsLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        </Card>
      </div>
    );
  }

  // Show error state for accounts
  if (!selectedAccount) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">No budget account selected</div>
          </div>
        </Card>
      </div>
    );
  }

  // Show loading state for debts
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        </Card>
      </div>
    );
  }

  // Show error state for debts
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading debts. Please try again.</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card variant="default" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <div className="flex items-center gap-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search recurring..."
              className="w-full sm:w-80"
            />
          </div>
          <Button
            onClick={() => openModal()}
            variant="primary"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Recurring
          </Button>
        </div>

        {/* List of existing debts */}
        <div className="flex flex-col gap-1 mb-6">
          {filteredDebts.length === 0 ? (
            <div className="bg-white/80 shadow rounded-xl px-8 py-8 text-center text-gray-500 border border-gray-200">
              {search ? "No debts found matching your search" : "No debts found"}
            </div>
          ) : (
            filteredDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                search={search}
                onEdit={openModal}
                onDelete={handleDelete}
                onPay={openPayModal}
              />
            ))
          )}
        </div>

        <AddEditModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          editingDebt={editingDebt}
          isLoading={isSubmitting}
        />

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
        />

        <PayModal
          isOpen={payModalOpen}
          onClose={closePayModal}
          onSubmit={handlePaySubmit}
          isLoading={isSubmitting}
        />
      </Card>
    </div>
  );
}

export default RecurringPage;
