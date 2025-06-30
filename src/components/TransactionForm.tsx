"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import CustomDatePicker from "./Forms/CustomDatePicker";
import CustomSelect from "./Forms/CustomSelect";
import TextField from "./Forms/TextField";

// Zod schema for form validation (now colocated with the form)
const transactionFormInputSchema = z.object({
  date: z.string().min(1, "Date is required"),
  merchantName: z.string().min(1, "Merchant name is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be a positive number"),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().optional(),
  description: z.string().optional(),
});

export const transactionFormSchema = transactionFormInputSchema.transform(
  (data) => ({
    ...data,
    amount: parseFloat(data.amount),
  }),
);

export type TransactionFormData = z.infer<typeof transactionFormSchema>;
export type TransactionFormInput = z.infer<typeof transactionFormInputSchema>;

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface TransactionFormProps {
  /** Callback function called when the form is submitted with valid data */
  onSubmit: (data: TransactionFormData) => void;
  /** Optional initial data to populate the form fields */
  initialData?: Partial<TransactionFormData>;
  /** Available categories for selection */
  categories?: Category[];
}

/**
 * TransactionForm Component
 *
 * A form component for creating or editing financial transactions using react-hook-form
 * and zod validation. It provides fields for entering transaction details such as date,
 * merchant, amount, category, and description.
 *
 * Features:
 * - Date picker for selecting transaction date
 * - Merchant name input with validation
 * - Amount input with currency formatting and validation
 * - Transaction type selection (income/expense)
 * - Category selection from available categories
 * - Optional description field
 * - Form validation using zod schema
 *
 * The form handles both creation and editing of transactions, initializing with either
 * default values or provided initial data.
 *
 * @param {TransactionFormProps} props - The component props
 * @param {Function} props.onSubmit - Callback function called with the form data when submitted
 * @param {TransactionFormData} [props.initialData] - Optional initial data to populate the form
 * @param {Category[]} [props.categories] - Available categories for selection
 *
 * @example
 * ```tsx
 * <TransactionForm
 *   onSubmit={(data) => handleTransactionSubmit(data)}
 *   initialData={existingTransaction}
 *   categories={availableCategories}
 * />
 * ```
 */
export default function TransactionForm({
  onSubmit,
  initialData,
  categories = [],
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionFormInputSchema),
    defaultValues: {
      date: initialData?.date || new Date().toISOString(),
      merchantName: initialData?.merchantName || "",
      amount: initialData?.amount?.toString() || "",
      type: initialData?.type || "expense",
      categoryId: initialData?.categoryId || "",
      description: initialData?.description || "",
    },
  });

  const transactionType = watch("type");

  /**
   * Handle form submission
   * Validates form data and calls onSubmit callback if valid
   */
  const handleFormSubmit = (data: TransactionFormInput) => {
    const transformedData = transactionFormSchema.parse(data);
    onSubmit(transformedData);
  };

  // Convert categories to options format for select input
  const categoryOptions = [
    { value: "", label: "Select a category" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  return (
    <form
      id="transaction-form"
      role="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      {/* Date input field */}
      <div>
        <CustomDatePicker
          id="date"
          label="Date"
          value={watch("date")}
          onChange={(date) => setValue("date", date)}
          required
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      {/* Merchant input field */}
      <div>
        <TextField
          id="merchantName"
          label="Merchant"
          {...register("merchantName")}
          placeholder="Enter merchant name"
          required
        />
        {errors.merchantName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.merchantName.message}
          </p>
        )}
      </div>

      {/* Amount input field with currency formatting */}
      <div>
        <TextField
          id="amount"
          label="Amount"
          type="number"
          {...register("amount")}
          placeholder="0.00"
          startAdornment={<span className="text-gray-500">$</span>}
          step="0.01"
          min="0"
          required
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Category selection field */}
      <div>
        <CustomSelect
          id="categoryId"
          label="Category"
          value={watch("categoryId") || ""}
          onChange={(value) => setValue("categoryId", value)}
          options={categoryOptions}
        />
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Transaction type selection */}
      <div>
        <CustomSelect
          id="type"
          label="Type"
          value={transactionType}
          onChange={(value) => setValue("type", value as "income" | "expense")}
          options={[
            { value: "expense", label: "Expense" },
            { value: "income", label: "Income" },
          ]}
          required
        />
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Optional description field */}
      <div>
        <TextField
          id="description"
          label="Description"
          {...register("description")}
          placeholder="Enter transaction description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>
    </form>
  );
}
