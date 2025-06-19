import { BudgetCategoryName } from "../types/budget.types";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import CustomSelect from "@/components/Forms/CustomSelect";
import NumberInput from "@/components/Forms/NumberInput";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category is required"),
  amount: z.string().refine((val) => {
    const amount = parseFloat(val);
    return !isNaN(amount) && amount > 0;
  }, "Please enter a valid amount greater than 0"),
  addAnother: z.boolean(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: newCategory.name,
      amount: newCategory.amount,
      addAnother: false,
    },
    resolver: zodResolver(categoryFormSchema),
  });

  // Update form errors when validation errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setFormErrors({
        name: errors.name?.message,
        amount: errors.amount?.message,
      });
    }
  }, [errors, setFormErrors]);

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting);
  }, [isSubmitting, onLoadingChange]);

  const clearForm = () => {
    setNewCategory({ name: "", amount: "" });
    setFormErrors({});
    reset({ name: "", amount: "", addAnother: false });
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const success = await onSave(data.addAnother);
      if (success) {
        if (!data.addAnother) {
          clearForm();
        } else {
          // If "Add another" is checked, only clear the amount and name
          setNewCategory({ name: "", amount: "" });
          setFormErrors({});
          reset({ name: "", amount: "", addAnother: true });
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  // Update form values when newCategory changes
  useEffect(() => {
    setValue("name", newCategory.name);
    setValue("amount", newCategory.amount);
  }, [newCategory, setValue]);

  const categoryOptions = availableCategories.map((category) => ({
    value: category,
    label: category,
  }));

  return (
    <form
      id="category-form"
      data-testid="category-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <CustomSelect
        id="category"
        label="Category"
        value={newCategory.name}
        onChange={(value) => {
          setNewCategory({ ...newCategory, name: value as BudgetCategoryName });
          setValue("name", value as BudgetCategoryName);
          setFormErrors({ ...formErrors, name: undefined });
        }}
        options={categoryOptions}
        required
        disabled={isEditing || isSubmitting}
        error={errors.name?.message || formErrors.name}
        placeholder="Select a category"
      />

      <NumberInput
        id="amount"
        label="Amount"
        value={newCategory.amount}
        onChange={(value) => {
          setNewCategory({ ...newCategory, amount: value });
          setValue("amount", value);
          setFormErrors({ ...formErrors, amount: undefined });
        }}
        required
        error={errors.amount?.message || formErrors.amount}
        leftIcon={<CurrencyDollarIcon className="h-5 w-5 text-secondary-400" />}
        placeholder="0.00"
        disabled={isSubmitting}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="addAnother"
          {...register("addAnother")}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
        />
        <label
          htmlFor="addAnother"
          className="ml-2 block text-sm text-secondary-700"
        >
          Add another category after this one
        </label>
      </div>
    </form>
  );
}
