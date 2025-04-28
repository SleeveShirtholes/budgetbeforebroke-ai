"use client";

import {
  TRANSACTION_CATEGORIES,
  Transaction,
  TransactionCategory,
} from "@/types/transaction";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { format, startOfDay } from "date-fns";
import { useEffect, useState } from "react";

import CustomSelect from "@/components/Forms/CustomSelect";
import Modal from "@/components/Modal";
import Table from "@/components/Table/Table";
import TransactionForm from "@/components/TransactionForm";
import { mockTransactions } from "@/data/mockTransactions";

/**
 * Transactions component that displays and manages financial transactions.
 * Features include:
 * - Display of income, expenses, and savings insights for the last 30 days
 * - Interactive transaction table with sorting and filtering
 * - Ability to add new transactions
 * - Ability to update transaction categories
 * - Detailed view of individual transactions
 *
 * @returns {JSX.Element} The rendered Transactions component
 */
export default function Transactions() {
  // State management for transactions, modal visibility, and loading state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load mock transactions on component mount
  useEffect(() => {
    // Initialize transactions after component mounts to ensure consistent date handling
    setTransactions(mockTransactions);
    setIsLoading(false);
  }, []);

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

  // Handler for creating new transactions
  const handleCreateTransaction = (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions([newTransaction, ...transactions]);
    setIsModalOpen(false);
  };

  // Handler for updating transaction categories
  const handleUpdateCategory = (
    transactionId: string,
    newCategory: TransactionCategory,
  ) => {
    setTransactions(
      transactions.map((t) =>
        t.id === transactionId
          ? { ...t, category: newCategory, updatedAt: new Date().toISOString() }
          : t,
      ),
    );
  };

  // Define table columns configuration with sorting, filtering, and custom rendering
  const columns = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      accessor: (row: Record<string, unknown>) =>
        format(new Date(row.date as string), "MMM d, yyyy"),
    },
    {
      key: "merchant",
      header: "Merchant",
      sortable: true,
      filterable: true,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
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
      key: "category",
      header: "Category",
      sortable: true,
      filterable: true,
      accessor: (row: Record<string, unknown>) => {
        const category = row.category as TransactionCategory;
        const id = row.id as string;
        return (
          <CustomSelect
            value={category}
            onChange={(value) =>
              handleUpdateCategory(id, value as TransactionCategory)
            }
            options={TRANSACTION_CATEGORIES.map((cat) => ({
              value: cat,
              label: cat,
            }))}
            label=""
            fullWidth={false}
          />
        );
      },
    },
  ];

  // Define detail panel for expanded transaction view
  const detailPanel = (row: Record<string, unknown>) => {
    const transaction = {
      id: row.id as string,
      description: row.description as string,
      merchant: row.merchant as string,
      merchantLocation: row.merchantLocation as string,
      date: row.date as string,
      amount: row.amount as number,
      type: row.type as "income" | "expense",
      category: row.category as TransactionCategory,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    };

    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-secondary-500">Description</p>
            <p className="font-medium">{transaction.description}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Transaction ID</p>
            <p className="font-medium">{transaction.id}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Merchant Location</p>
            <p className="font-medium">
              {transaction.merchantLocation || "N/A"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Insights Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6 border border-secondary-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-secondary-600">
                Income
              </h3>
              <p className="mt-2 text-xl font-semibold text-green-600">
                $
                {totalIncome.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <ArrowTrendingUpIcon
                className="w-6 h-6 text-green-600"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-secondary-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-secondary-600">
                Expenses
              </h3>
              <p className="mt-2 text-xl font-semibold text-red-600">
                $
                {totalExpenses.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <ArrowTrendingDownIcon
                className="w-6 h-6 text-red-600"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-secondary-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-secondary-600">
                Money Saved
              </h3>
              <p
                className={`mt-2 text-xl font-semibold ${netSavings >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                $
                {Math.abs(netSavings).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${netSavings >= 0 ? "bg-green-50" : "bg-red-50"}`}
            >
              <BanknotesIcon
                className={`w-6 h-6 ${netSavings >= 0 ? "text-green-600" : "text-red-600"}`}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-white rounded-xl shadow border border-secondary-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">
              Transactions
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Transaction
            </button>
          </div>

          <Table
            data={transactions as unknown as Record<string, unknown>[]}
            columns={columns}
            detailPanel={detailPanel}
            pageSize={25}
            showPagination={true}
          />
        </div>
      </div>

      {/* Transaction Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Transaction"
        maxWidth="xl"
        footerButtons={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              form="transaction-form"
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create Transaction
            </button>
          </>
        }
      >
        <TransactionForm onSubmit={handleCreateTransaction} />
      </Modal>
    </div>
  );
}
