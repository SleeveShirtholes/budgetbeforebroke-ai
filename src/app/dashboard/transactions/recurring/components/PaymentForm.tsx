import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomDatePicker from "@/components/Forms/CustomDatePicker";
import DecimalInput from "@/components/Forms/DecimalInput";
import TextField from "@/components/Forms/TextField";
import {
  debtPaymentFormSchema,
  type DebtPaymentFormData,
} from "@/lib/schemas/debt";

/**
 * Form component for recording a payment on a recurring debt.
 * Uses react-hook-form with Zod validation for form handling.
 * Provides proper formatting for monetary values and date selection.
 */
interface PaymentFormProps {
  onSubmit: (data: DebtPaymentFormData) => void;
  isLoading?: boolean;
}

export default function PaymentForm({
  onSubmit,
  isLoading = false,
}: PaymentFormProps) {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DebtPaymentFormData>({
    resolver: zodResolver(debtPaymentFormSchema),
    defaultValues: {
      amount: undefined,
      date: new Date().toISOString().slice(0, 10),
      note: "",
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = (data: DebtPaymentFormData) => {
    onSubmit(data);
  };

  return (
    <form
      id="pay-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
      role="form"
    >
      <DecimalInput
        label="Amount"
        value={watchedValues.amount?.toString() || ""}
        onChange={(value) => setValue("amount", parseFloat(value) || 0)}
        error={errors.amount?.message}
        required
        placeholder="0.00"
        leftIcon={<span className="text-gray-500">$</span>}
        id="amount"
        disabled={isLoading}
        maxDecimalPlaces={2}
      />
      <CustomDatePicker
        label="Date"
        value={watchedValues.date || ""}
        onChange={(date) => setValue("date", date)}
        error={errors.date?.message}
        required
        id="date"
        disabled={isLoading}
      />
      <TextField
        label="Note (optional)"
        value={watchedValues.note || ""}
        onChange={(e) => setValue("note", e.target.value)}
        error={errors.note?.message}
        placeholder="e.g., Monthly payment"
        id="note"
        disabled={isLoading}
      />
    </form>
  );
}
