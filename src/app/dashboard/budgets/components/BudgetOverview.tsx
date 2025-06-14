import { BanknotesIcon, PencilIcon } from "@heroicons/react/24/outline";

import Button from "@/components/Button";
import Card from "@/components/Card";
import NumberInput from "@/components/Forms/NumberInput";
import { formatCurrency } from "../utils/budget.utils";

/**
 * Props interface for the BudgetOverview component
 * @interface BudgetOverviewProps
 * @property {number} totalBudget - The total available budget amount
 * @property {number} totalBudgeted - The amount that has been allocated to categories
 * @property {number} remainingBudget - The difference between total budget and budgeted amount
 * @property {boolean} isEditing - Whether the total budget is being edited
 * @property {string} totalBudgetInput - The current value of the total budget input
 * @property {boolean} isUpdating - Whether the total budget is being updated
 * @property {() => void} onEditClick - Function to handle edit button click
 * @property {(value: string) => void} onTotalBudgetChange - Function to handle total budget input change
 * @property {() => void} onSave - Function to handle save button click
 * @property {() => void} onCancel - Function to handle cancel button click
 */
interface BudgetOverviewProps {
  totalBudget: number;
  totalBudgeted: number;
  remainingBudget: number;
  isEditing?: boolean;
  totalBudgetInput?: string;
  isUpdating?: boolean;
  onEditClick?: () => void;
  onTotalBudgetChange?: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

/**
 * BudgetOverview Component
 *
 * Displays a grid of three cards showing key budget metrics:
 * 1. Total available budget (with edit functionality)
 * 2. Amount already budgeted
 * 3. Remaining amount to budget (color-coded based on whether it's positive or negative)
 *
 * @component
 * @param {BudgetOverviewProps} props - The props for the BudgetOverview component
 * @returns {JSX.Element} A responsive grid of budget summary cards
 */
export const BudgetOverview = ({
  totalBudget,
  totalBudgeted,
  remainingBudget,
  isEditing = false,
  totalBudgetInput = "",
  isUpdating = false,
  onEditClick,
  onTotalBudgetChange,
  onSave,
  onCancel,
}: BudgetOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-secondary-600">
              Total Budget
            </h3>
            <div className="mt-2 flex items-center gap-x-8 gap-y-2">
              {isEditing ? (
                <div className="flex flex-col min-w-0 w-56">
                  <NumberInput
                    label=""
                    value={totalBudgetInput}
                    onChange={onTotalBudgetChange!}
                    placeholder="0.00"
                    leftIcon={<span className="text-gray-500">$</span>}
                    id="edit-total-budget"
                    fullWidth
                    data-testid="edit-total-budget-input"
                  />
                  <div className="flex flex-col md:flex-row gap-2 mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onSave}
                      isLoading={isUpdating}
                    >
                      Save
                    </Button>
                    <Button variant="secondary" size="sm" onClick={onCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-2xl font-semibold text-secondary-900">
                    {totalBudget < 0 ? "-" : ""}$
                    {formatCurrency(Math.abs(totalBudget))}
                  </span>
                  {onEditClick && (
                    <Button
                      variant="text"
                      size="sm"
                      onClick={onEditClick}
                      className="p-1"
                      data-testid="edit-total-budget"
                    >
                      <PencilIcon className="w-4 h-4 text-secondary-500" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="p-3 bg-primary-50 rounded-lg">
            <BanknotesIcon
              className="w-6 h-6 text-primary-600"
              data-testid="icon"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-secondary-600">
              Budgeted Amount
            </h3>
            <p className="mt-2 text-2xl font-semibold text-primary-600">
              {totalBudgeted < 0 ? "-" : ""}$
              {formatCurrency(Math.abs(totalBudgeted))}
            </p>
          </div>
          <div className="p-3 bg-primary-50 rounded-lg">
            <BanknotesIcon
              className="w-6 h-6 text-primary-600"
              data-testid="icon"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-secondary-600">
              Remaining to Budget
            </h3>
            <p
              className={`mt-2 text-2xl font-semibold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {remainingBudget < 0 ? "-" : ""}$
              {formatCurrency(Math.abs(remainingBudget))}
            </p>
          </div>
          <div
            className={`p-3 rounded-lg ${remainingBudget >= 0 ? "bg-green-50" : "bg-red-50"}`}
          >
            <BanknotesIcon
              className={`w-6 h-6 ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}
              data-testid="icon"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
