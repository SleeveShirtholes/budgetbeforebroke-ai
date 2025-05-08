import CustomDatePicker from "@/components/Forms/CustomDatePicker";
import NumberInput from "@/components/Forms/NumberInput";
import TextField from "@/components/Forms/TextField";

/**
 * Form component for recording a payment on a recurring debt.
 * Handles input for payment amount, date, and optional notes.
 * Provides proper formatting for monetary values and date selection.
 */
interface PaymentFormProps {
  amount: string;
  date: string;
  note: string;
  onAmountChange: (value: string) => void;
  onDateChange: (date: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PaymentForm({
  amount,
  date,
  note,
  onAmountChange,
  onDateChange,
  onNoteChange,
  onSubmit,
}: PaymentFormProps) {
  return (
    <form id="pay-form" onSubmit={onSubmit} className="space-y-4" role="form">
      <NumberInput
        label="Amount"
        value={amount}
        onChange={onAmountChange}
        required
        placeholder="0.00"
        leftIcon={<span className="text-gray-500">$</span>}
        id="amount"
      />
      <CustomDatePicker
        label="Date"
        value={date}
        onChange={onDateChange}
        required
        id="date"
      />
      <TextField
        label="Note (optional)"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="e.g., Monthly payment"
        id="note"
      />
    </form>
  );
}
