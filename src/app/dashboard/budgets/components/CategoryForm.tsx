import { useEffect, useState } from "react";

import CustomSelect from "@/components/Forms/CustomSelect";
import NumberInput from "@/components/Forms/NumberInput";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { z } from "zod";
import { BudgetCategoryName } from "../types/budget.types";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category is required"),
  amount: z.string().refine((val) => {
    const amount = parseFloat(val);
    return !isNaN(amount) && amount > 0;
  }, "Please enter a valid amount greater than 0"),
  addAnother: z.boolean(),
});

interface CategoryFormProps {
  newCategory: { name: BudgetCategoryName | ""; amount: string };
  setNewCategory: (category: {
    name: BudgetCategoryName | "";
    amount: string;
  }) => void;
  formErrors: { name?: string; amount?: string };
  setFormErrors: (errors: { name?: string; amount?: string }) => void;
  availableCategories: BudgetCategoryName[];
  isEditing: boolean;
  onSave: (keepOpen: boolean) => Promise<boolean>;
  editCategoryId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

/**
 * CategoryForm Component
 *
 * A form component for adding or editing budget categories. It provides a select input for category names
 * and a number input for the budget amount. The form handles validation and provides different button
 * options based on whether it's being used for editing or creating a new category.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.newCategory - The current category being edited or created
 * @param {string} props.newCategory.name - The name of the category
 * @param {string} props.newCategory.amount - The budget amount for the category
 * @param {Function} props.setNewCategory - Function to update the new category state
 * @param {Object} props.formErrors - Object containing any form validation errors
 * @param {Function} props.setFormErrors - Function to update form errors state
 * @param {string[]} props.availableCategories - List of available category names
 * @param {boolean} props.isEditing - Flag indicating if the form is in edit mode
 * @param {Function} props.onSave - Callback function when the form is saved
 * @param {string} props.editCategoryId - The ID of the category being edited
 * @param {Function} props.onLoadingChange - Callback function to notify parent of loading state changes
 * @returns {JSX.Element} The rendered category form component
 */
export function CategoryForm({
  newCategory,
  setNewCategory,
  formErrors,
  setFormErrors,
  availableCategories,
  isEditing,
  onSave,
  onLoadingChange,
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addAnother, setAddAnother] = useState(false);

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting);
  }, [isSubmitting, onLoadingChange]);

  const clearForm = () => {
    setNewCategory({ name: "", amount: "" });
    setFormErrors({});
    setAddAnother(false);
  };

  const validateForm = (): boolean => {
    try {
      categoryFormSchema.parse({
        name: newCategory.name,
        amount: newCategory.amount,
        addAnother,
      });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: { name?: string; amount?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof typeof errors] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const success = await onSave(addAnother);
      // Only clear the form if the save was successful
      if (success && !addAnother) {
        clearForm();
      } else if (success && addAnother) {
        // If "Add another" is checked, only clear the amount and name
        setNewCategory({ name: "", amount: "" });
        setFormErrors({});
        // Don't clear the checkbox here since we want to keep adding
      }
    } catch (error) {
      console.error("Error saving category:", error);
      // Don't clear the form on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = availableCategories.map((category) => ({
    value: category,
    label: category,
  }));

  return (
    <form
      id="category-form"
      data-testid="category-form"
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <CustomSelect
        id="category"
        label="Category"
        value={newCategory.name}
        onChange={(value) => {
          setNewCategory({ ...newCategory, name: value as BudgetCategoryName });
          setFormErrors({ ...formErrors, name: undefined });
        }}
        options={categoryOptions}
        required
        disabled={isEditing || isSubmitting}
        error={formErrors.name}
        placeholder="Select a category"
      />

      <NumberInput
        id="amount"
        label="Amount"
        value={newCategory.amount}
        onChange={(value) => {
          setNewCategory({ ...newCategory, amount: value });
          setFormErrors({ ...formErrors, amount: undefined });
        }}
        required
        error={formErrors.amount}
        leftIcon={<CurrencyDollarIcon className="h-5 w-5 text-secondary-400" />}
        placeholder="0.00"
        disabled={isSubmitting}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="addAnother"
          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          checked={addAnother}
          onChange={(e) => setAddAnother(e.target.checked)}
          disabled={isSubmitting}
        />
        <label
          htmlFor="addAnother"
          className="ml-2 block text-sm text-secondary-700"
        >
          Add another category
        </label>
      </div>
    </form>
  );
}
