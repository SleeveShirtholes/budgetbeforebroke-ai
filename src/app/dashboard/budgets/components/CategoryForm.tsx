import {
  createBudgetCategory,
  updateBudgetCategory,
} from "@/app/actions/budget";
import { SubmitHandler, useForm } from "react-hook-form";

import Button from "@/components/Button";
import CustomSelect from "@/components/Forms/CustomSelect";
import NumberInput from "@/components/Forms/NumberInput";
import { useToast } from "@/components/Toast";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSWRConfig } from "swr";
import { z } from "zod";
import { BudgetCategoryName } from "../types/budget.types";

const categoryFormSchema = z.object({
  name: z.custom<BudgetCategoryName>((val) => {
    return typeof val === "string" && val.length > 0;
  }, "Category name is required"),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be greater than 0"),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  budgetId: string;
  newCategory: { name: BudgetCategoryName | ""; amount: string };
  setNewCategory: (category: {
    name: BudgetCategoryName | "";
    amount: string;
  }) => void;
  formErrors: { name?: string; amount?: string };
  setFormErrors: (errors: { name?: string; amount?: string }) => void;
  availableCategories: BudgetCategoryName[];
  isEditing: boolean;
  onSave: (keepOpen: boolean) => void;
  onCancel: () => void;
  editCategoryId?: string;
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
 * @param {string} props.budgetId - The ID of the budget
 * @param {Object} props.newCategory - The current category being edited or created
 * @param {string} props.newCategory.name - The name of the category
 * @param {string} props.newCategory.amount - The budget amount for the category
 * @param {Function} props.setNewCategory - Function to update the new category state
 * @param {Object} props.formErrors - Object containing any form validation errors
 * @param {Function} props.setFormErrors - Function to update form errors state
 * @param {string[]} props.availableCategories - List of available category names
 * @param {boolean} props.isEditing - Flag indicating if the form is in edit mode
 * @param {Function} props.onSave - Callback function when the form is saved
 * @param {Function} props.onCancel - Callback function when the form is cancelled
 * @param {string} props.editCategoryId - The ID of the category being edited
 * @returns {JSX.Element} The rendered category form component
 */
export const CategoryForm = ({
  budgetId,
  newCategory,
  setNewCategory,
  formErrors,
  setFormErrors,
  availableCategories,
  isEditing,
  onSave,
  onCancel,
  editCategoryId,
}: CategoryFormProps) => {
  const { showToast } = useToast();
  const { mutate } = useSWRConfig();

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: newCategory.name || undefined,
      amount: newCategory.amount,
    },
  });

  const customSelectOptions = isEditing
    ? [
        { value: newCategory.name, label: newCategory.name },
        ...availableCategories
          .filter((cat) => cat !== newCategory.name)
          .map((cat) => ({ value: cat, label: cat })),
      ]
    : availableCategories.map((cat) => ({ value: cat, label: cat }));

  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    try {
      if (isEditing && editCategoryId) {
        await updateBudgetCategory(editCategoryId, parseFloat(data.amount));
        showToast("Category updated successfully!", { type: "success" });
      } else {
        await createBudgetCategory(
          budgetId,
          data.name as BudgetCategoryName,
          parseFloat(data.amount),
        );
        showToast("Category added successfully!", { type: "success" });
      }
      await mutate(`/api/budgets/${budgetId}/categories`);
      onSave(false);
    } catch (error) {
      console.error("Failed to save category:", error);
      showToast("Failed to save category. Please try again.", {
        type: "error",
      });
    }
  };

  const onSubmitAndAddAnother: SubmitHandler<CategoryFormData> = async (
    data,
  ) => {
    try {
      if (isEditing && editCategoryId) {
        await updateBudgetCategory(editCategoryId, parseFloat(data.amount));
        showToast("Category updated successfully!", { type: "success" });
      } else {
        await createBudgetCategory(
          budgetId,
          data.name as BudgetCategoryName,
          parseFloat(data.amount),
        );
        showToast("Category added successfully!", { type: "success" });
      }
      await mutate(`/api/budgets/${budgetId}/categories`);
      onSave(true);
    } catch (error) {
      console.error("Failed to save category:", error);
      showToast("Failed to save category. Please try again.", {
        type: "error",
      });
    }
  };

  return (
    <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 max-w-md mx-auto"
      >
        <div className="w-full">
          <div className="min-h-[60px]">
            <CustomSelect
              value={newCategory.name}
              onChange={(value) => {
                setValue("name", value as BudgetCategoryName);
                setNewCategory({
                  ...newCategory,
                  name: value as BudgetCategoryName,
                });
                setFormErrors({ ...formErrors, name: undefined });
              }}
              options={customSelectOptions}
              label="Category"
              placeholder="Select a category"
              clearable={true}
              error={errors.name?.message || formErrors.name}
              disabled={isEditing}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="min-h-[60px]">
            <NumberInput
              value={newCategory.amount}
              onChange={(value) => {
                setValue("amount", value);
                setNewCategory({ ...newCategory, amount: value });
                setFormErrors({ ...formErrors, amount: undefined });
              }}
              onBlur={(value) => {
                const rawValue = value.replace(/[^0-9.]/g, "");
                setValue("amount", rawValue);
                setNewCategory({
                  ...newCategory,
                  amount: rawValue,
                });
              }}
              label=""
              placeholder="0.00"
              error={errors.amount?.message || formErrors.amount}
              leftIcon={<CurrencyDollarIcon className="h-5 w-5" />}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          {isEditing ? (
            <>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleSubmit(onSubmitAndAddAnother)}
                disabled={isSubmitting}
              >
                Save & Add Another
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleSubmit(onSubmitAndAddAnother)}
                disabled={isSubmitting}
              >
                Add & Add Another
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
