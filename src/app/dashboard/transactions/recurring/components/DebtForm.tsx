import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomDatePicker from "@/components/Forms/CustomDatePicker";
import NumberInput from "@/components/Forms/NumberInput";
import DecimalInput from "@/components/Forms/DecimalInput";
import TextField from "@/components/Forms/TextField";
import { debtFormSchema, type DebtFormData } from "@/lib/schemas/debt";
import { Debt } from "@/types/debt";

interface DebtFormProps {
  debt?: Debt;
  onSubmit: (
    data: Omit<DebtFormData, "balance" | "interestRate"> & {
      balance: number;
      interestRate: number;
    },
  ) => void;
  isLoading?: boolean;
}

/**
 * Form component for creating or editing a recurring debt.
 * Uses react-hook-form with Zod validation for form handling.
 * Provides validation and proper formatting for monetary and percentage values.
 */
export default function DebtForm({
  debt,
  onSubmit,
  isLoading = false,
}: DebtFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DebtFormData & { balance: string; interestRate: string }>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      name: debt?.name || "",
      balance: debt?.balance !== undefined ? debt.balance.toString() : "",
      interestRate:
        debt?.interestRate !== undefined ? debt.interestRate.toString() : "",
      dueDate: debt?.dueDate
        ? new Date(debt.dueDate).toISOString().slice(0, 10)
        : "",
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = (
    data: DebtFormData & { balance: string; interestRate: string },
  ) => {
    // Convert string values to numbers, fallback to 0 if blank
    onSubmit({
      ...data,
      balance: data.balance === "" ? 0 : parseFloat(data.balance),
      interestRate:
        data.interestRate === "" ? 0 : parseFloat(data.interestRate),
    });
  };

  return (
    <form
      id="debt-form"
      className="space-y-4"
      role="form"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <TextField
        label="Name"
        {...register("name")}
        error={errors.name?.message}
        required
        placeholder="e.g., Car Loan, Credit Card"
        id="name"
        disabled={isLoading}
      />

      <NumberInput
        label="Balance"
        value={watchedValues.balance ?? ""}
        onChange={(value) => setValue("balance", value)}
        error={errors.balance?.message}
        required
        placeholder="0.00"
        leftIcon={<span className="text-gray-500">$</span>}
        id="balance"
        disabled={isLoading}
      />

      <DecimalInput
        label="Interest Rate"
        value={watchedValues.interestRate ?? ""}
        onChange={(value) => setValue("interestRate", value)}
        error={errors.interestRate?.message}
        required
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
    </form>
  );
}
