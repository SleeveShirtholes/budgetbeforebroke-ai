"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { format, startOfDay } from "date-fns";

import Button from "@/components/Button";
import CustomSelect from "@/components/Forms/CustomSelect";
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";
import Table from "@/components/Table/Table";
import TransactionForm from "@/components/TransactionForm";
import {
  createTransaction,
  getTransactionCategories,
  getTransactions,
  updateTransactionCategory,
} from "@/app/actions/transaction";
import { useToast } from "@/components/Toast";
import { useBudgetAccount } from "@/stores/budgetAccountStore";

/**
 * Transactions component that displays and manages financial transactions.
 * Features include:
 * - Display of income, expenses, and savings insights for the last 30 days
 * - Interactive transaction table with sorting and filtering
 * - Ability to add new transactions
 * - Ability to update transaction categories
 * - Detailed view of individual transactions
 * - Real-time data synchronization using SWR
 * - Filtering by selected budget account
 *
 * @returns {JSX.Element} The rendered Transactions component
 */
export default function Transactions() {
  const { showToast } = useToast();
  const { selectedAccount } = useBudgetAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch transactions using SWR with selected account
  const {
    data: transactions = [],
    error: transactionsError,
    isLoading: isLoadingTransactions,
  } = useSWR(
    selectedAccount ? ["transactions", selectedAccount.id] : null,
    () => (selectedAccount ? getTransactions(selectedAccount.id) : []),
  );

  // Fetch categories using SWR with selected account
  const {
    data: categories = [],
    error: categoriesError,
    isLoading: isLoadingCategories,
  } = useSWR(
    selectedAccount ? ["transaction-categories", selectedAccount.id] : null,
    () => (selectedAccount ? getTransactionCategories(selectedAccount.id) : []),
  );

  // Calculate insights
  const getTimeframeDate = () => {
    const now = startOfDay(new Date());
    return new Date(now.setDate(now.getDate() - 30));
  };

  // Filter transactions for the last 30 days
  const timeframeTransactions = transactions.filter(
    (t) => new Date(t.date) >= getTimeframeDate(),
  );

  // Calculate total income for the timeframe
  const totalIncome = timeframeTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate total expenses for the timeframe
  const totalExpenses = timeframeTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate net savings (income - expenses)
  const netSavings = totalIncome - totalExpenses;

  // Define table columns configuration with sorting, filtering, and custom rendering
  const columns = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      filterable: true,
      accessor: (row: Record<string, unknown>) =>
        format(new Date(row.date as string), "MMM d, yyyy"),
    },
    {
      key: "merchantName",
      header: "Merchant",
      sortable: true,
      filterable: true,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      filterable: true,
      accessor: (row: Record<string, unknown>) => {
        const type = row.type as "income" | "expense";
        const amount = row.amount as number;
        return (
          <span
            className={type === "income" ? "text-green-600" : "text-red-600"}
          >
            {type === "income" ? "+" : "-"}$
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      key: "categoryName",
      header: "Category",
      sortable: true,
      filterable: true,
      accessor: (row: Record<string, unknown>) => {
        const transactionId = row.id as string;
        const currentCategoryId = row.categoryId as string | null;

        return (
          <CustomSelect
            value={currentCategoryId || ""}
            onChange={async (value) => {
              try {
                await updateTransactionCategory(transactionId, value || null);
                // Mutate both transactions and categories to update the UI
                if (selectedAccount) {
                  await mutate(["transactions", selectedAccount.id]);
                  await mutate(["transaction-categories", selectedAccount.id]);
                }
                showToast("Category updated successfully", { type: "success" });
              } catch (error) {
                console.error("Failed to update category:", error);
                showToast("Failed to update category", { type: "error" });
              }
            }}
            options={[
              { value: "", label: "No category" },
              ...categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })),
            ]}
            label=""
            fullWidth={false}
          />
        );
      },
    },
  ];

  /**
   * Handle form submission for creating a new transaction
   */
  const handleCreateTransaction = async (data: {
    date: string;
    merchantName: string;
    amount: number;
    type: "income" | "expense";
    categoryId?: string;
    description?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await createTransaction(data);
      // Mutate both transactions and categories to update the UI
      if (selectedAccount) {
        await mutate(["transactions", selectedAccount.id]);
        await mutate(["transaction-categories", selectedAccount.id]);
      }
      setIsModalOpen(false);
      showToast("Transaction created successfully", { type: "success" });
    } catch (error) {
      console.error("Failed to create transaction:", error);
      showToast("Failed to create transaction", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (!selectedAccount || isLoadingTransactions || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (transactionsError || categoriesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Failed to load transactions. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
              <ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-sm font-medium text-gray-600">Income</p>
              <p className="text-xl sm:text-2xl font-semibold text-green-600">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-red-100 rounded-full">
              <ArrowTrendingDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-sm font-medium text-gray-600">Expenses</p>
              <p className="text-xl sm:text-2xl font-semibold text-red-600">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-sm font-medium text-gray-600">Net Savings</p>
              <p
                className={`text-xl sm:text-2xl font-semibold ${
                  netSavings >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${Math.abs(netSavings).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold">Transactions</h2>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              fullWidth
              className="sm:w-auto"
            >
              Add Transaction
            </Button>
          </div>
          <Table
            data={transactions as unknown as Record<string, unknown>[]}
            columns={columns}
            pageSize={10}
          />
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Transaction"
        maxWidth="md"
        footerButtons={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              fullWidth
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="transaction-form"
              isLoading={isSubmitting}
              fullWidth
              className="sm:w-auto"
            >
              Save
            </Button>
          </div>
        }
      >
        <TransactionForm
          onSubmit={handleCreateTransaction}
          categories={categories}
        />
      </Modal>
    </div>
  );
}
