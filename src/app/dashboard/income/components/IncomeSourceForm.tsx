import { Controller, useForm } from "react-hook-form";

import type { IncomeSource } from "@/app/actions/income";
import Button from "@/components/Button";
import CustomDatePicker from "@/components/Forms/CustomDatePicker";
import CustomSelect from "@/components/Forms/CustomSelect";
import NumberInput from "@/components/Forms/NumberInput";
import TextArea from "@/components/Forms/TextArea";
import TextField from "@/components/Forms/TextField";
import Modal from "@/components/Modal/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";

/**
 * Zod schema for validating income source form data
 *
 * Validates:
 * - name: Required non-empty string
 * - amount: Required positive number
 * - frequency: Must be one of weekly, bi-weekly, or monthly
 * - startDate: Required date string
 * - endDate: Optional date string
 * - notes: Optional string
 */
const incomeSourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.string().refine((val) => {
    const amount = parseFloat(val);
    return !isNaN(amount) && amount > 0;
  }, "Amount must be a positive number"),
  frequency: z.enum(["weekly", "bi-weekly", "monthly"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

/** TypeScript type derived from the income source schema */
export type IncomeSourceFormData = z.infer<typeof incomeSourceSchema>;

/**
 * Props interface for the IncomeSourceForm component
 */
interface IncomeSourceFormProps {
  /** Whether the modal form is currently open */
  isOpen: boolean;
  /** Callback function to close the modal */
  onClose: () => void;
  /** Async callback function to handle form submission */
  onSubmit: (data: IncomeSourceFormData) => Promise<void>;
  /** Whether the form submission is currently in progress */
  isSubmitting: boolean;
  /** Optional income source data for editing mode */
  editingSource?: IncomeSource;
}

/**
 * Modal form component for creating or editing income sources
 *
 * This component provides a comprehensive form for managing income sources with:
 * - Form validation using Zod schema
 * - Support for both create and edit modes
 * - Custom form components for better UX
 * - Proper loading states during submission
 * - Date handling with date-fns formatting
 *
 * The form includes fields for:
 * - Name of the income source
 * - Amount (validated as positive number)
 * - Frequency (weekly, bi-weekly, monthly)
 * - Start date (required)
 * - End date (optional)
 * - Notes (optional)
 *
 * @param props - The component props
 * @param props.isOpen - Controls whether the modal is visible
 * @param props.onClose - Function called when the modal should be closed
 * @param props.onSubmit - Async function called when form is submitted
 * @param props.isSubmitting - Indicates if form submission is in progress
 * @param props.editingSource - Optional income source data for edit mode
 *
 * @returns A modal form for creating or editing income sources
 */
export function IncomeSourceForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingSource,
}: IncomeSourceFormProps) {
  // Initialize form with react-hook-form and Zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IncomeSourceFormData>({
    // Set default values based on editing mode or current date
    defaultValues: {
      name: editingSource?.name ?? "",
      amount: editingSource?.amount.toString() ?? "",
      frequency: editingSource?.frequency ?? "monthly",
      startDate: editingSource?.startDate
        ? format(editingSource.startDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      endDate: editingSource?.endDate
        ? format(editingSource.endDate, "yyyy-MM-dd")
        : undefined,
      notes: editingSource?.notes,
    },
    resolver: zodResolver(incomeSourceSchema),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSource ? "Edit Income Source" : "Add Income Source"}
      footerButtons={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          {/* Cancel button - disabled during submission */}
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            fullWidth
            className="sm:w-auto"
          >
            Cancel
          </Button>

          {/* Submit button - shows loading state and is disabled during submission */}
          <Button
            type="submit"
            variant="primary"
            form="income-source-form"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            className="sm:w-auto"
          >
            {editingSource ? "Update" : "Add"} Income Source
          </Button>
        </div>
      }
    >
      {/* Main form with all income source fields */}
      <form
        id="income-source-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Income source name field */}
        <TextField
          label="Name"
          {...register("name")}
          error={errors.name?.message}
          placeholder="e.g., Salary, Freelance"
        />

        {/* Amount field using NumberInput for better number handling */}
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <NumberInput
              label="Amount"
              value={field.value}
              onChange={field.onChange}
              error={errors.amount?.message}
              placeholder="0.00"
            />
          )}
        />

        {/* Frequency selection using custom select component */}
        <Controller
          name="frequency"
          control={control}
          render={({ field }) => (
            <CustomSelect
              label="Frequency"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "weekly", label: "Weekly" },
                { value: "bi-weekly", label: "Bi-weekly" },
                { value: "monthly", label: "Monthly" },
              ]}
              error={errors.frequency?.message}
            />
          )}
        />

        {/* Start date field using custom date picker */}
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <CustomDatePicker
              label="Start Date"
              value={field.value}
              onChange={field.onChange}
              error={errors.startDate?.message}
            />
          )}
        />

        {/* Optional end date field using custom date picker */}
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <CustomDatePicker
              label="End Date (Optional)"
              value={field.value}
              onChange={field.onChange}
              error={errors.endDate?.message}
            />
          )}
        />

        {/* Optional notes field for additional information */}
        <TextArea
          label="Notes (Optional)"
          {...register("notes")}
          error={errors.notes?.message}
          placeholder="Additional notes about this income source"
        />
      </form>
    </Modal>
  );
}
