"use client";

import { TRANSACTION_CATEGORIES, TransactionCategory } from "@/types/transaction";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { format, startOfDay } from "date-fns";

import Button from "@/components/Button";
import CustomSelect from "@/components/Forms/CustomSelect";
import Modal from "@/components/Modal";
import Table from "@/components/Table/Table";
import TransactionForm from "@/components/TransactionForm";
import useTransactionsStore from "@/stores/transactionsStore";
import { useEffect } from "react";

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
    const { transactions, isModalOpen, setIsModalOpen, createTransaction, updateCategory, initializeTransactions } =
        useTransactionsStore();

    // Load mock transactions on component mount
    useEffect(() => {
        initializeTransactions();
    }, [initializeTransactions]);

    // Calculate insights
    const getTimeframeDate = () => {
        const now = startOfDay(new Date());
        return new Date(now.setDate(now.getDate() - 30));
    };

    // Filter transactions for the last 30 days
    const timeframeTransactions = transactions.filter((t) => new Date(t.date) >= getTimeframeDate());

    // Calculate total income for the timeframe
    const totalIncome = timeframeTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

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
            accessor: (row: Record<string, unknown>) => format(new Date(row.date as string), "MMM d, yyyy"),
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
            filterable: true,
            accessor: (row: Record<string, unknown>) => {
                const type = row.type as "income" | "expense";
                const amount = row.amount as number;
                return (
                    <span className={type === "income" ? "text-green-600" : "text-red-600"}>
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
                        onChange={(value) => updateCategory(id, value as TransactionCategory)}
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

    return (
        <div className="space-y-6">
            {/* Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full">
                            <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Income</p>
                            <p className="text-2xl font-semibold text-green-600">${totalIncome.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-full">
                            <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Expenses</p>
                            <p className="text-2xl font-semibold text-red-600">${totalExpenses.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <BanknotesIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Net Savings</p>
                            <p
                                className={`text-2xl font-semibold ${
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
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Transactions</h2>
                        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
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
                footerButtons={[
                    <Button key="cancel" variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>,
                    <Button key="save" variant="primary" type="submit" form="transaction-form">
                        Save
                    </Button>,
                ]}
            >
                <TransactionForm onSubmit={createTransaction} />
            </Modal>
        </div>
    );
}
