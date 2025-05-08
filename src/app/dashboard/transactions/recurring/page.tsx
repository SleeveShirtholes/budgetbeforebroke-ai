"use client";

import Button from "@/components/Button";
import Card from "@/components/Card";
import SearchInput from "@/components/Forms/SearchInput";
import { useToast } from "@/components/Toast";
import { RecurringDebt } from "@/types/debt";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import AddEditModal from "./components/AddEditModal";
import DebtCard from "./components/DebtCard";
import DeleteModal from "./components/DeleteModal";
import PayModal from "./components/PayModal";

/**
 * RecurringPage Component
 *
 * A page component that manages recurring debts and payments. It provides functionality to:
 * - View a list of recurring debts with their details
 * - Add new recurring debts
 * - Edit existing recurring debts
 * - Delete recurring debts
 * - Record payments against debts
 * - Search and filter debts
 *
 * The component maintains local state for debts and various modal interactions.
 * Each debt includes details like name, balance, interest rate, due date, and payment history.
 */
function RecurringPage() {
  // State for managing the list of recurring debts
  const [debts, setDebts] = useState<RecurringDebt[]>([
    {
      id: "1",
      name: "Car Loan",
      balance: "15,000",
      interestRate: "4.5",
      dueDate: "2025-05-07",
      payments: [
        {
          id: "p1",
          amount: "300",
          date: "2024-05-01",
          note: "Monthly payment",
        },
        {
          id: "p2",
          amount: "300",
          date: "2024-04-01",
          note: "Monthly payment",
        },
      ],
    },
    {
      id: "2",
      name: "Credit Card",
      balance: "3,200",
      interestRate: "19.99",
      dueDate: "2024-07-15",
      payments: [
        {
          id: "p3",
          amount: "150",
          date: "2024-05-03",
          note: "Minimum payment",
        },
      ],
    },
    {
      id: "3",
      name: "Student Loan",
      balance: "28,000",
      interestRate: "6.8",
      dueDate: "2026-09-01",
      payments: [],
    },
    {
      id: "4",
      name: "Personal Loan",
      balance: "7,500",
      interestRate: "8.2",
      dueDate: "2024-12-20",
      payments: [{ id: "p4", amount: "200", date: "2024-05-05" }],
    },
    {
      id: "5",
      name: "Home Equity Line",
      balance: "12,000",
      interestRate: "5.25",
      dueDate: "2025-03-10",
      payments: [],
    },
  ]);
  // State for managing the editing mode and form data
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<RecurringDebt, "id">>({
    name: "",
    balance: "",
    interestRate: "",
    dueDate: "",
    payments: [],
  });
  // State for managing various modal interactions
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingDebtId, setPayingDebtId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<{
    amount: string;
    date: string;
    note: string;
  }>({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const { showToast } = useToast();

  const openModal = (debt?: RecurringDebt) => {
    if (debt) {
      setFormData({
        name: debt.name,
        balance: debt.balance,
        interestRate: debt.interestRate,
        dueDate: debt.dueDate,
        payments: debt.payments || [],
      });
      setEditingId(debt.id);
    } else {
      setFormData({
        name: "",
        balance: "",
        interestRate: "",
        dueDate: "",
        payments: [],
      });
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      balance: "",
      interestRate: "",
      dueDate: "",
      payments: [],
    });
  };

  const handleSubmit = (e: React.FormEvent, addAnother: boolean = false) => {
    e.preventDefault();
    try {
      if (editingId) {
        setDebts(
          debts.map((debt) =>
            debt.id === editingId ? { ...formData, id: editingId } : debt,
          ),
        );
        setEditingId(null);
        setModalOpen(false);
        showToast("Recurring updated successfully!", { type: "success" });
      } else {
        setDebts([...debts, { ...formData, id: crypto.randomUUID() }]);
        if (!addAnother) {
          setModalOpen(false);
        }
        showToast("Recurring added successfully!", { type: "success" });
      }
      setFormData({
        name: "",
        balance: "",
        interestRate: "",
        dueDate: "",
        payments: [],
      });
    } catch (err) {
      console.error("Error saving recurring:", err);
      showToast("Failed to save recurring. Please try again.", {
        type: "error",
      });
    }
  };

  const handleDelete = (id: string) => {
    setDeletingDebtId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingDebtId) return;
    setDebts(debts.filter((debt) => debt.id !== deletingDebtId));
    showToast("Recurring deleted successfully!", { type: "success" });
    setDeleteModalOpen(false);
    setDeletingDebtId(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeletingDebtId(null);
  };

  const openPayModal = (debtId: string) => {
    setPayingDebtId(debtId);
    setPaymentForm({
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    setPayModalOpen(false);
    setPayingDebtId(null);
    setPaymentForm({
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebtId) return;
    setDebts((prev) =>
      prev.map((debt) => {
        if (debt.id !== payingDebtId) return debt;
        const newBalance = (
          parseFloat(debt.balance.replace(/,/g, "")) -
          parseFloat(paymentForm.amount || "0")
        ).toLocaleString();
        return {
          ...debt,
          balance: newBalance,
          payments: [
            {
              id: crypto.randomUUID(),
              amount: paymentForm.amount,
              date: paymentForm.date,
              note: paymentForm.note,
            },
            ...debt.payments,
          ],
        };
      }),
    );
    showToast("Payment successful!", { type: "success" });
    closePayModal();
  };

  const filteredDebts = debts.filter((debt) => {
    const query = search.toLowerCase();
    return (
      debt.name.toLowerCase().includes(query) ||
      debt.balance.toLowerCase().includes(query) ||
      debt.interestRate.toLowerCase().includes(query) ||
      new Date(debt.dueDate).toLocaleDateString().toLowerCase().includes(query)
    );
  });

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
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Recurring
          </Button>
        </div>

        {/* List of existing debts */}
        <div className="flex flex-col gap-1 mb-6">
          {filteredDebts.length === 0 ? (
            <div className="bg-white/80 shadow rounded-xl px-8 py-8 text-center text-gray-500 border border-gray-200">
              No recurring found
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
          editingId={editingId}
          formData={formData}
          onChange={setFormData}
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
          amount={paymentForm.amount}
          date={paymentForm.date}
          note={paymentForm.note}
          onAmountChange={(value) =>
            setPaymentForm((f) => ({ ...f, amount: value }))
          }
          onDateChange={(date) => setPaymentForm((f) => ({ ...f, date }))}
          onNoteChange={(value) =>
            setPaymentForm((f) => ({ ...f, note: value }))
          }
        />
      </Card>
    </div>
  );
}

export default RecurringPage;
