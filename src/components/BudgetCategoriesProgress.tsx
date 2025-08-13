import Button from "./Button";
import Spinner from "./Spinner";

/**
 * Interface representing a budget category with spending and budget information
 */
interface BudgetCategory {
  name: string;
  spent: number;
  budget: number;
  color: string;
}

/**
 * Props for the BudgetCategoriesProgress component
 */
interface BudgetCategoriesProgressProps {
  /** Array of budget categories to display */
  categories: BudgetCategory[];
  /** Callback function triggered when a category is clicked for transaction filtering */
  onCategoryClick?: (category: string) => void;
  /** Set of currently selected categories for transaction filtering */
  selectedCategories?: Set<string>;
  /** Callback function to clear all selected categories for transaction filtering */
  onClearSelection?: () => void;
  /** Current chart view mode - affects category selection behavior */
  chartViewMode?: "total" | "byCategory" | "incomeVsExpense";
  /** Set of categories selected for chart display (used in byCategory mode) */
  selectedChartCategories?: Set<string>;
  /** Callback function to toggle a category's selection for chart display */
  onChartCategoryToggle?: (category: string) => void;
  /** Callback function to clear all chart category selections */
  onClearChartSelection?: () => void;
  /** Whether the categories are currently loading */
  isLoading?: boolean;
}

/**
 * BudgetCategoriesProgress Component
 *
 * Displays a list of budget categories with progress bars showing spending vs budget.
 * Supports dual selection modes:
 * - Transaction filtering: Click categories to filter transactions
 * - Chart display: In "byCategory" mode, click categories to show/hide them in charts
 *
 * Features:
 * - Visual progress bars with color coding (red for overspent, primary color for normal)
 * - Percentage spent and remaining amount display
 * - Clear selection buttons for both filtering and chart modes
 * - Visual feedback for selected categories
 *
 * @param props - Component props containing categories and callback functions
 * @returns JSX element displaying budget categories with progress indicators
 */
export default function BudgetCategoriesProgress({
  categories,
  onCategoryClick,
  selectedCategories,
  onClearSelection,
  chartViewMode,
  selectedChartCategories,
  onChartCategoryToggle,
  onClearChartSelection,
  isLoading,
}: BudgetCategoriesProgressProps) {
  /**
   * Handles category click events for both transaction filtering and chart selection
   * @param category - The name of the clicked category
   */
  const handleCategoryClick = (category: string) => {
    // Always update the selected categories for transaction filtering
    if (onCategoryClick) {
      onCategoryClick(category);
    }

    // Handle chart category selection if in byCategory view
    if (chartViewMode === "byCategory" && onChartCategoryToggle) {
      onChartCategoryToggle(category);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-secondary-100">
      {/* Header section with title and clear selection buttons */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-800">
          Budget Categories
        </h3>
        <div className="flex items-center space-x-2">
          {/* Clear chart selection button - only shown in byCategory mode when categories are selected */}
          {chartViewMode === "byCategory" &&
            selectedChartCategories &&
            selectedChartCategories.size > 0 && (
              <Button
                variant="text"
                size="sm"
                onClick={onClearChartSelection}
                className="text-primary-600 hover:text-primary-700"
              >
                Clear Chart Selection
              </Button>
            )}
          {/* Clear transaction filter selection button - only shown when categories are selected */}
          {selectedCategories && selectedCategories.size > 0 && (
            <Button
              variant="text"
              size="sm"
              onClick={onClearSelection}
              className="text-primary-600 hover:text-primary-700"
            >
              Clear Selection
            </Button>
          )}
        </div>
      </div>

      {/* Categories list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : (
          categories.map((category) => {
            // Calculate percentage spent (capped at 100%)
            // Handle case where budget is 0 to avoid NaN
            const percentage =
              category.budget === 0
                ? category.spent === 0
                  ? 0
                  : 100 // If no budget, show 0% if no spending, 100% if there is spending
                : Math.min((category.spent / category.budget) * 100, 100);

            // Calculate remaining budget (minimum 0)
            const remaining = Math.max(category.budget - category.spent, 0);
            // Determine if category is overspent
            const isOverspent = category.spent > category.budget;
            // Check if category is selected for transaction filtering
            const isSelected = selectedCategories?.has(category.name);
            // Check if category is selected for chart display
            const isChartSelected =
              chartViewMode === "byCategory" &&
              selectedChartCategories?.has(category.name);

            return (
              <div
                key={category.name}
                className={`space-y-2 cursor-pointer transition-colors duration-200 ${
                  isSelected || isChartSelected
                    ? "bg-primary-50 p-3 rounded-lg"
                    : ""
                }`}
                onClick={() => handleCategoryClick(category.name)}
              >
                {/* Category header with name and spending/budget amounts */}
                <div className="flex justify-between text-sm">
                  <span
                    className={`font-medium ${isSelected || isChartSelected ? "text-primary-700" : "text-secondary-700"}`}
                  >
                    {category.name}
                  </span>
                  <span className="text-secondary-600">
                    ${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}
                  </span>
                </div>

                {/* Progress bar showing spending vs budget */}
                <div className="relative h-3 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full transition-all duration-300 ease-in-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isOverspent
                        ? "#EF4444" // Red for overspent categories
                        : "var(--color-primary-500)", // Primary color for normal spending
                    }}
                  />
                </div>

                {/* Footer with percentage spent and remaining amount */}
                <div className="flex justify-between text-xs text-secondary-500">
                  <span>
                    {percentage % 1 === 0
                      ? `${percentage}%`
                      : `${percentage.toFixed(1)}%`}{" "}
                    spent
                  </span>
                  <span>${remaining.toFixed(2)} remaining</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
