import CustomDatePicker from "@/components/Forms/CustomDatePicker";
import NumberInput from "@/components/Forms/NumberInput";
import TextField from "@/components/Forms/TextField";
import { RecurringDebt } from "@/types/debt";

interface DebtFormProps {
  formData: Omit<RecurringDebt, "id">;
  onChange: (data: Omit<RecurringDebt, "id">) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Form component for creating or editing a recurring debt.
 * Handles input for debt name, balance, interest rate, and due date.
 * Provides validation and proper formatting for monetary and percentage values.
 */
export default function DebtForm({
  formData,
  onChange,
  onSubmit,
}: DebtFormProps) {
  return (
    <form id="debt-form" className="space-y-4" role="form" onSubmit={onSubmit}>
      <TextField
        label="Name"
        value={formData.name}
        onChange={(e) => onChange({ ...formData, name: e.target.value })}
        required
        placeholder="e.g., Car Loan, Credit Card"
        id="name"
      />

      <NumberInput
        label="Balance"
        value={formData.balance}
        onChange={(value) => onChange({ ...formData, balance: value })}
        required
        placeholder="0.00"
        leftIcon={<span className="text-gray-500">$</span>}
        id="balance"
      />

      <NumberInput
        label="Interest Rate"
        value={formData.interestRate}
        onChange={(value) => onChange({ ...formData, interestRate: value })}
        required
        placeholder="0.00"
        rightIcon={<span className="text-gray-500">%</span>}
        id="interest-rate"
      />

      <CustomDatePicker
        label="Due Date"
        value={formData.dueDate}
        onChange={(date) => onChange({ ...formData, dueDate: date })}
        required
        id="due-date"
      />
    </form>
  );
}
