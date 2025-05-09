import { TransactionCategory } from "@/types/transaction";
import Button from "./Button";

interface BudgetCategory {
  name: string;
  spent: number;
  budget: number;
  color: string;
}

interface BudgetCategoriesProgressProps {
  categories: BudgetCategory[];
  onCategoryClick?: (category: TransactionCategory) => void;
  selectedCategories?: Set<TransactionCategory>;
  onClearSelection?: () => void;
  chartViewMode?: "total" | "byCategory" | "incomeVsExpense";
  selectedChartCategories?: Set<TransactionCategory>;
  onChartCategoryToggle?: (category: TransactionCategory) => void;
  onClearChartSelection?: () => void;
}

export default function BudgetCategoriesProgress({
  categories,
  onCategoryClick,
  selectedCategories,
  onClearSelection,
  chartViewMode,
  selectedChartCategories,
  onChartCategoryToggle,
  onClearChartSelection,
}: BudgetCategoriesProgressProps) {
  const handleCategoryClick = (category: TransactionCategory) => {
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-800">
          Budget Categories
        </h3>
        <div className="flex items-center space-x-2">
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
      <div className="space-y-4">
        {categories.map((category) => {
          const percentage = Math.min(
            (category.spent / category.budget) * 100,
            100,
          );
          const remaining = Math.max(category.budget - category.spent, 0);
          const isOverspent = category.spent > category.budget;
          const isSelected = selectedCategories?.has(
            category.name as TransactionCategory,
          );
          const isChartSelected =
            chartViewMode === "byCategory" &&
            selectedChartCategories?.has(category.name as TransactionCategory);

          return (
            <div
              key={category.name}
              className={`space-y-2 cursor-pointer transition-colors duration-200 ${
                isSelected || isChartSelected
                  ? "bg-primary-50 p-3 rounded-lg"
                  : ""
              }`}
              onClick={() =>
                handleCategoryClick(category.name as TransactionCategory)
              }
            >
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
              <div className="relative h-3 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="absolute h-full rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: isOverspent
                      ? "#EF4444"
                      : "var(--color-primary-500)",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-secondary-500">
                <span>{percentage.toFixed(1)}% spent</span>
                <span>${remaining.toFixed(2)} remaining</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
