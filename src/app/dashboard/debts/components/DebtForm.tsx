import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomDatePicker from "@/components/Forms/CustomDatePicker";
import NumberInput from "@/components/Forms/NumberInput";
import DecimalInput from "@/components/Forms/DecimalInput";
import TextField from "@/components/Forms/TextField";
import CustomSelect from "@/components/Forms/CustomSelect";
import { debtFormSchema, type DebtFormData } from "@/lib/schemas/debt";
import { Debt } from "@/types/debt";
import { useCategories } from "@/hooks/useCategories";

interface DebtFormProps {
  debt?: Debt;
  budgetAccountId: string;
  onSubmit: (
    data: Omit<DebtFormData, "paymentAmount" | "interestRate"> & {
      paymentAmount: number;
      interestRate: number;
    },
  ) => void;
  isLoading?: boolean;
}

/**
 * Form component for creating or editing a debt.
 * Uses react-hook-form with Zod validation for form handling.
 * Provides validation and proper formatting for monetary and percentage values.
 */
export default function DebtForm({
  debt,
  budgetAccountId,
  onSubmit,
  isLoading = false,
}: DebtFormProps) {
  const { categories, isLoading: categoriesLoading } =
    useCategories(budgetAccountId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      name: debt?.name || "",
      categoryId: debt?.categoryId || "",
      paymentAmount:
        debt?.paymentAmount !== undefined ? debt.paymentAmount.toString() : "",
      interestRate:
        debt?.interestRate !== undefined ? debt.interestRate.toString() : "",
      dueDate: debt?.dueDate
        ? new Date(debt.dueDate).toISOString().slice(0, 10)
        : "",
      hasBalance: debt?.hasBalance || false,
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = (data: DebtFormData) => {
    // Convert string values to numbers, fallback to 0 if blank
    onSubmit({
      ...data,
      paymentAmount:
        data.paymentAmount === "" ? 0 : parseFloat(data.paymentAmount),
      interestRate:
        data.interestRate === "" || !data.interestRate
          ? 0
          : parseFloat(data.interestRate),
    });
  };

  return (
    <form
      id="debt-form"
      className="space-y-4"
      role="form"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      {/* Helpful description for users */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-2">
        <p className="text-sm text-primary-700">
          <strong>What can you add?</strong> Track any type of debt or recurring
          payment including credit cards, car loans, student loans, rent,
          utilities, insurance, subscriptions, and more.
        </p>
      </div>

      <TextField
        label="Name"
        {...register("name")}
        error={errors.name?.message}
        required
        placeholder="e.g., Car Loan, Credit Card"
        id="name"
        disabled={isLoading}
      />

      <CustomSelect
        label="Category (Optional)"
        value={watchedValues.categoryId || ""}
        onChange={(value) => setValue("categoryId", value)}
        error={errors.categoryId?.message}
        placeholder="Select a category"
        id="category"
        disabled={isLoading || categoriesLoading}
        options={[
          { value: "", label: "No category" },
          ...(categories?.map((category) => ({
            value: category.id,
            label: category.name,
          })) || []),
        ]}
      />

      <NumberInput
        label="Payment Amount"
        value={watchedValues.paymentAmount ?? ""}
        onChange={(value) => setValue("paymentAmount", value)}
        error={errors.paymentAmount?.message}
        required
        placeholder="0.00"
        leftIcon={<span className="text-gray-500">$</span>}
        id="payment-amount"
        disabled={isLoading}
      />

      <DecimalInput
        label="Interest Rate (Optional)"
        value={watchedValues.interestRate ?? ""}
        onChange={(value) => setValue("interestRate", value)}
        error={errors.interestRate?.message}
        placeholder="0.00"
        rightIcon={<span className="text-gray-500">%</span>}
        id="interest-rate"
        disabled={isLoading}
        maxDecimalPlaces={2}
      />

      <CustomDatePicker
        label="Due Date"
        value={watchedValues.dueDate || ""}
        onChange={(date) => setValue("dueDate", date)}
        error={errors.dueDate?.message}
        required
        id="due-date"
        disabled={isLoading}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="has-balance"
          {...register("hasBalance")}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label
          htmlFor="has-balance"
          className="ml-2 block text-sm text-gray-900"
        >
          This debt has a running balance (like a credit card)
        </label>
      </div>
    </form>
  );
}
