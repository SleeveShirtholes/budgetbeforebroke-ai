"use client";

import { TRANSACTION_CATEGORIES, Transaction, TransactionCategory } from "@/types/transaction";

import { useState } from "react";
import CustomDatePicker from "./Forms/CustomDatePicker";
import CustomSelect from "./Forms/CustomSelect";
import TextField from "./Forms/TextField";

interface TransactionFormProps {
    /** Callback function called when the form is submitted with valid data */
    onSubmit: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void;
    /** Optional initial data to populate the form fields */
    initialData?: Transaction;
}

/**
 * TransactionForm Component
 *
 * A form component for creating or editing financial transactions. It provides fields for
 * entering transaction details such as date, merchant, amount, category, and description.
 *
 * Features:
 * - Date picker for selecting transaction date
 * - Merchant name input with validation
 * - Amount input with currency formatting and validation
 * - Category selection from predefined options
 * - Optional description field
 *
 * The form handles both creation and editing of transactions, initializing with either
 * default values or provided initial data.
 *
 * @param {TransactionFormProps} props - The component props
 * @param {Function} props.onSubmit - Callback function called with the form data when submitted
 * @param {Transaction} [props.initialData] - Optional initial data to populate the form
 *
 * @example
 * ```tsx
 * <TransactionForm
 *   onSubmit={(data) => handleTransactionSubmit(data)}
 *   initialData={existingTransaction}
 * />
 * ```
 */
export default function TransactionForm({ onSubmit, initialData }: TransactionFormProps) {
    // Initialize form state with either initial data or default values
    const [formData, setFormData] = useState<Partial<Transaction>>(
        initialData || {
            date: new Date().toISOString(),
            amount: 0,
            category: "Other",
        }
    );

    // Convert transaction categories to options format for select input
    const categoryOptions = TRANSACTION_CATEGORIES.map((category) => ({
        value: category,
        label: category,
    }));

    /**
     * Handle form submission
     * Validates required fields and calls onSubmit callback if valid
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.date && formData.merchant && formData.amount !== undefined && formData.category) {
            onSubmit(formData as Omit<Transaction, "id" | "createdAt" | "updatedAt">);
        }
    };

    return (
        <form id="transaction-form" role="form" onSubmit={handleSubmit} className="space-y-6">
            {/* Date input field */}
            <CustomDatePicker
                id="date"
                label="Date"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                required
            />

            {/* Merchant input field */}
            <TextField
                id="merchant"
                label="Merchant"
                value={formData.merchant || ""}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                placeholder="Enter merchant name"
                required
            />

            {/* Amount input field with currency formatting */}
            <TextField
                id="amount"
                label="Amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                placeholder="0.00"
                startAdornment={<span className="text-gray-500">$</span>}
                step="0.01"
                min="0"
                required
            />

            {/* Category selection field */}
            <CustomSelect
                id="category"
                label="Category"
                value={formData.category || "Other"}
                onChange={(value) => setFormData({ ...formData, category: value as TransactionCategory })}
                options={categoryOptions}
                required
            />

            {/* Optional description field */}
            <TextField
                id="description"
                label="Description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter transaction description"
            />
        </form>
    );
}
