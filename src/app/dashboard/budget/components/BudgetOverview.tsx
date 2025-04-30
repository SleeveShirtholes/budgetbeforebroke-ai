import Card from "@/components/Card";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "../utils/budget.utils";

/**
 * Props interface for the BudgetOverview component
 * @interface BudgetOverviewProps
 * @property {number} totalBudget - The total available budget amount
 * @property {number} totalBudgeted - The amount that has been allocated to categories
 * @property {number} remainingBudget - The difference between total budget and budgeted amount
 */
interface BudgetOverviewProps {
    totalBudget: number;
    totalBudgeted: number;
    remainingBudget: number;
}

/**
 * BudgetOverview Component
 *
 * Displays a grid of three cards showing key budget metrics:
 * 1. Total available budget
 * 2. Amount already budgeted
 * 3. Remaining amount to budget (color-coded based on whether it's positive or negative)
 *
 * @component
 * @param {BudgetOverviewProps} props - The props for the BudgetOverview component
 * @returns {JSX.Element} A responsive grid of budget summary cards
 */
export const BudgetOverview = ({ totalBudget, totalBudgeted, remainingBudget }: BudgetOverviewProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-secondary-600">Total Budget</h3>
                        <div className="mt-2 flex items-center">
                            <span className="w-full text-2xl font-semibold text-secondary-900 block text-left">
                                ${formatCurrency(totalBudget)}
                            </span>
                        </div>
                    </div>
                    <div className="p-3 bg-primary-50 rounded-lg">
                        <BanknotesIcon className="w-6 h-6 text-primary-600" data-testid="icon" />
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-secondary-600">Budgeted Amount</h3>
                        <p className="mt-2 text-2xl font-semibold text-primary-600">${formatCurrency(totalBudgeted)}</p>
                    </div>
                    <div className="p-3 bg-primary-50 rounded-lg">
                        <BanknotesIcon className="w-6 h-6 text-primary-600" data-testid="icon" />
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-secondary-600">Remaining to Budget</h3>
                        <p
                            className={`mt-2 text-2xl font-semibold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                            ${formatCurrency(Math.abs(remainingBudget))}
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg ${remainingBudget >= 0 ? "bg-green-50" : "bg-red-50"}`}>
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
