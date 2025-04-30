import Button from "@/components/Button";
import CustomSelect from "@/components/Forms/CustomSelect";
import NumberInput from "@/components/Forms/NumberInput";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { BudgetCategoryName } from "../types/budget.types";

interface FormErrors {
  name?: string;
  amount?: string;
}

interface CategoryFormProps {
  newCategory: { name: BudgetCategoryName | ""; amount: string };
  setNewCategory: (category: {
    name: BudgetCategoryName | "";
    amount: string;
  }) => void;
  formErrors: FormErrors;
  setFormErrors: (errors: FormErrors) => void;
  availableCategories: BudgetCategoryName[];
  isEditing: boolean;
  onSave: (keepOpen: boolean) => void;
  onCancel: () => void;
  customSelectRef: React.RefObject<HTMLInputElement | null>;
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
 * @param {Function} props.onCancel - Callback function when the form is cancelled
 * @param {React.RefObject} props.customSelectRef - Reference to the custom select input
 * @returns {JSX.Element} The rendered category form component
 */
export const CategoryForm = ({
  newCategory,
  setNewCategory,
  formErrors,
  setFormErrors,
  availableCategories,
  isEditing,
  onSave,
  onCancel,
  customSelectRef,
}: CategoryFormProps) => {
  const customSelectOptions = isEditing
    ? [
        { value: newCategory.name, label: newCategory.name },
        ...availableCategories
          .filter((cat) => cat !== newCategory.name)
          .map((cat) => ({ value: cat, label: cat })),
      ]
    : availableCategories.map((cat) => ({ value: cat, label: cat }));

  return (
    <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <div className="w-full">
          <div className="min-h-[60px]">
            <CustomSelect
              ref={customSelectRef}
              value={newCategory.name}
              onChange={(value) => {
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
              error={formErrors.name}
              disabled={isEditing}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="min-h-[60px]">
            <NumberInput
              value={newCategory.amount}
              onChange={(value) => {
                setNewCategory({ ...newCategory, amount: value });
                setFormErrors({ ...formErrors, amount: undefined });
              }}
              onBlur={(value) => {
                const rawValue = value.replace(/[^0-9.]/g, "");
                setNewCategory({
                  ...newCategory,
                  amount: rawValue,
                });
              }}
              label=""
              placeholder="0.00"
              error={formErrors.amount}
              leftIcon={<CurrencyDollarIcon className="h-5 w-5" />}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          {isEditing ? (
            <>
              <Button variant="primary" size="md" onClick={() => onSave(false)}>
                Save
              </Button>
              <Button variant="outline" size="md" onClick={() => onSave(true)}>
                Save & Add Another
              </Button>
              <Button variant="secondary" size="md" onClick={onCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" size="md" onClick={() => onSave(false)}>
                Add
              </Button>
              <Button variant="outline" size="md" onClick={() => onSave(true)}>
                Add & Add Another
              </Button>
              <Button variant="secondary" size="md" onClick={onCancel}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
