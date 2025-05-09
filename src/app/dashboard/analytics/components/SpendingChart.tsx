import Card from "@/components/Card";
import CustomSelect from "@/components/Forms/CustomSelect";
import MonthlySpendingChart from "@/components/MonthlySpendingChart";
import { TransactionCategory } from "@/types/transaction";

// Defines the possible view modes for the spending chart
type ChartViewMode = "total" | "byCategory" | "incomeVsExpense";

// Props interface for the SpendingChart component
interface SpendingChartProps {
  chartData: {
    data: Array<{ month: string; amount: number }>;
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
      fill: boolean;
      pointBackgroundColor: string;
      pointBorderColor: string;
      pointRadius: number;
      pointHoverRadius: number;
    }>;
  };
  chartViewMode: ChartViewMode;
  selectedCategories: Set<TransactionCategory>;
  onChartViewModeChange: (mode: ChartViewMode) => void;
}

/**
 * SpendingChart Component
 *
 * A reusable component that displays spending data in various visualization modes.
 * It supports three different view modes: total spending, spending by category, and income vs expenses.
 * The component includes a header with a dynamic title based on selected categories and a view mode selector.
 *
 * @param {SpendingChartProps} props - The component props
 * @param {Object} props.chartData - The data to be displayed in the chart
 * @param {Array} props.chartData.data - Array of monthly spending data points
 * @param {Array} props.chartData.datasets - Array of chart datasets with styling properties
 * @param {ChartViewMode} props.chartViewMode - Current view mode of the chart
 * @param {Set<TransactionCategory>} props.selectedCategories - Set of selected transaction categories
 * @param {Function} props.onChartViewModeChange - Callback function to handle view mode changes
 *
 * @returns {JSX.Element} A chart component with view mode controls
 */
export default function SpendingChart({
  chartData,
  chartViewMode,
  selectedCategories,
  onChartViewModeChange,
}: SpendingChartProps) {
  // Available view mode options for the chart
  const viewModeOptions = [
    { value: "total", label: "Total Spending" },
    { value: "byCategory", label: "By Category" },
    { value: "incomeVsExpense", label: "Income vs Expenses" },
  ];

  return (
    <Card>
      {/* Header section with dynamic title and view mode selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-800">
          {selectedCategories.size === 1
            ? `${Array.from(selectedCategories)[0]} Spending`
            : selectedCategories.size > 1
              ? "Selected Categories Spending"
              : "Daily Spending"}
        </h3>
        <div className="flex items-center space-x-4">
          <CustomSelect
            value={chartViewMode}
            onChange={(value) => onChartViewModeChange(value as ChartViewMode)}
            options={viewModeOptions}
            label=""
            fullWidth={false}
          />
        </div>
      </div>
      {/* Chart container with fixed height */}
      <div className="h-[400px]">
        <MonthlySpendingChart
          data={chartData.data}
          datasets={chartData.datasets}
        />
      </div>
    </Card>
  );
}
