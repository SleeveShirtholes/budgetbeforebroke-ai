import {
  BanknotesIcon,
  ChartBarIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

import Card from "@/components/Card";

/**
 * Props interface for the BudgetOverview component
 * @interface BudgetOverviewProps
 * @property {number} totalBudget - The total available budget amount
 * @property {number} totalBudgeted - The amount that has been allocated to categories
 * @property {number} remainingBudget - The difference between total budget and budgeted amount
 * @property {boolean} isEditing - Whether the total budget is being edited
 * @property {string} totalBudgetInput - The current value of the total budget input
 * @property {boolean} isUpdating - Whether the total budget is being updated
 * @property {(value: string) => void} onTotalBudgetChange - Function to handle total budget input change
 * @property {() => void} onSave - Function to handle save button click
 * @property {() => void} onCancel - Function to handle cancel button click
 * @property {number} monthlyIncome - The monthly income amount
 */
interface BudgetOverviewProps {
  totalBudget: number;
  totalBudgeted: number;
  remainingBudget: number;
  monthlyIncome?: number;
  isEditing?: boolean;
  totalBudgetInput?: string;
  isUpdating?: boolean;
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
export function BudgetOverview({
  totalBudget,
  totalBudgeted,
  remainingBudget,
  monthlyIncome,
  isEditing = false,
  totalBudgetInput = "",
  isUpdating = false,
  onTotalBudgetChange,
  onSave,
  onCancel,
}: BudgetOverviewProps) {
  const formatAmount = (amount: number) => {
    const abs = Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-$${abs}` : `$${abs}`;
  };

  const getRemainingTextColor = (amount: number) => {
    return amount >= 0 ? "text-green-600" : "text-red-600";
  };

  const getRemainingIconColor = (amount: number) => {
    return amount >= 0 ? "text-green-600" : "text-red-600";
  };

  const getRemainingIconBg = (amount: number) => {
    return amount >= 0 ? "bg-green-50" : "bg-red-50";
  };

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50">
            <BanknotesIcon
              className="w-7 h-7 text-primary-600"
              aria-hidden="true"
              data-testid="icon"
            />
          </span>
          <div>
            <h3 className="text-sm font-medium text-secondary-500">
              Total Budget
            </h3>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={totalBudgetInput}
                  onChange={(e) => onTotalBudgetChange?.(e.target.value)}
                  className="text-2xl font-semibold text-secondary-900 w-32"
                  aria-label=""
                />
                <button
                  onClick={onSave}
                  className="text-sm text-primary-600 hover:text-primary-700"
                  disabled={isUpdating}
                >
                  Save
                </button>
                <button
                  onClick={onCancel}
                  className="text-sm text-secondary-600 hover:text-secondary-700"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold text-secondary-900">
                  {formatAmount(totalBudget)}
                </p>
              </div>
            )}
            {monthlyIncome && (
              <p className="mt-1 text-sm text-secondary-500">
                Based on income sources
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-1">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50">
            <ChartBarIcon
              className="w-7 h-7 text-primary-600"
              aria-hidden="true"
              data-testid="icon"
            />
          </span>
          <div>
            <h3 className="text-sm font-medium text-secondary-500">
              Budgeted Amount
            </h3>
            <p className="text-2xl font-semibold text-secondary-900">
              {formatAmount(totalBudgeted)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-1">
          <span
            className={`flex items-center justify-center w-12 h-12 rounded-full ${getRemainingIconBg(remainingBudget)}`}
          >
            <WalletIcon
              className={`w-7 h-7 ${getRemainingIconColor(remainingBudget)}`}
              aria-hidden="true"
              data-testid="icon"
            />
          </span>
          <div>
            <h3 className="text-sm font-medium text-secondary-500">
              Remaining to Budget
            </h3>
            <p
              className={`text-2xl font-semibold ${getRemainingTextColor(remainingBudget)}`}
            >
              {formatAmount(remainingBudget)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
