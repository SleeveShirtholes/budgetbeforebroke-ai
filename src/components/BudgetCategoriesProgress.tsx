interface BudgetCategory {
  name: string;
  spent: number;
  budget: number;
  color: string;
}

interface BudgetCategoriesProgressProps {
  categories: BudgetCategory[];
}

export default function BudgetCategoriesProgress({
  categories,
}: BudgetCategoriesProgressProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-secondary-100">
      <h3 className="text-lg font-semibold mb-4 text-secondary-800">
        Budget Categories
      </h3>
      <div className="space-y-4">
        {categories.map((category) => {
          const percentage = Math.min(
            (category.spent / category.budget) * 100,
            100,
          );
          const remaining = Math.max(category.budget - category.spent, 0);
          const isOverspent = category.spent > category.budget;

          return (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-secondary-700">
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
                    backgroundColor: isOverspent ? "#EF4444" : "#4e008e",
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
