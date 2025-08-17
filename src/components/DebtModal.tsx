import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";
import CustomDatePicker from "@/components/Forms/CustomDatePicker";
import NumberInput from "@/components/Forms/NumberInput";
import DecimalInput from "@/components/Forms/DecimalInput";
import TextField from "@/components/Forms/TextField";
import CustomSelect from "@/components/Forms/CustomSelect";
import { debtFormSchema, type DebtFormData } from "@/lib/schemas/debt";
import { Debt } from "@/types/debt";
import { useCategories } from "@/hooks/useCategories";

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetAccountId: string;
  debt?: Debt;
  onSubmit: (
    data: Omit<DebtFormData, "paymentAmount" | "interestRate"> & {
      paymentAmount: number;
      interestRate: number;
    },
  ) => void;
  isLoading?: boolean;
  title?: string;
}

/**
 * Unified modal component for adding or editing a debt.
 * Can be used in both dashboard/debts and paycheck-planning sections.
 * Uses react-hook-form with Zod validation for form handling.
 */
export default function DebtModal({
  isOpen,
  onClose,
  budgetAccountId,
  debt,
  onSubmit,
  isLoading = false,
  title,
}: DebtModalProps) {
  const { categories, isLoading: categoriesLoading } =
    useCategories(budgetAccountId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
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

  // Reset form when debt changes or modal opens
  useEffect(() => {
    if (isOpen && debt) {
      // Update form values when debt changes
      setValue("name", debt.name || "");
      setValue("categoryId", debt.categoryId || "");
      setValue(
        "paymentAmount",
        debt.paymentAmount !== undefined ? debt.paymentAmount.toString() : "",
      );
      setValue(
        "interestRate",
        debt.interestRate !== undefined ? debt.interestRate.toString() : "",
      );
      setValue(
        "dueDate",
        debt.dueDate ? new Date(debt.dueDate).toISOString().slice(0, 10) : "",
      );
      setValue("hasBalance", debt.hasBalance || false);
    } else if (isOpen && !debt) {
      // Clear form values for new debt
      setValue("name", "");
      setValue("categoryId", "");
      setValue("paymentAmount", "");
      setValue("interestRate", "");
      setValue("dueDate", "");
      setValue("hasBalance", false);
    }
  }, [isOpen, debt, setValue]);

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

  const handleClose = () => {
    reset();
    onClose();
  };

  const modalTitle = title || (debt ? "Edit Debt" : "Add New Debt");

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      maxWidth="md"
      footerButtons={
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="debt-form"
            variant="primary"
            size="sm"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {debt ? "Save Changes" : "Add"}
          </Button>
        </div>
      }
    >
      <form
        id="debt-form"
        className="space-y-4"
        role="form"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        {/* Helpful description for users */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-2">
          <p className="text-sm text-primary-700">
            <strong>What can you add?</strong> Track any type of debt or
            recurring payment including credit cards, car loans, student loans,
            rent, utilities, insurance, subscriptions, and more.
          </p>
        </div>

        {/* Debug: Show validation errors if any */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              <strong>Please fix the following errors:</strong>
            </p>
            <ul className="mt-2 text-sm text-red-600">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {error?.message}</li>
              ))}
            </ul>
          </div>
        )}

        <TextField
          label="Name"
          {...register("name")}
          error={errors.name?.message}
          required
          placeholder="e.g., Car Loan, Credit Card"
          id="name"
          data-testid="debt-name-input"
          disabled={isLoading}
        />

        <CustomSelect
          key={`category-${debt?.id || "new"}-${debt?.categoryId || "none"}`}
          label="Category (Optional)"
          value={watchedValues.categoryId || ""}
          onChange={(value) => setValue("categoryId", value)}
          error={errors.categoryId?.message}
          placeholder="Select a category"
          id="category"
          data-testid="debt-category-select"
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
          data-testid="debt-payment-amount-input"
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
          data-testid="debt-interest-rate-input"
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
          data-testid="debt-due-date-input"
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
    </Modal>
  );
}
