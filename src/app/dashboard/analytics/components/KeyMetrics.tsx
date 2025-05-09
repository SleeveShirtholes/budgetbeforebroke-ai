import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

import StatsCard from "@/components/StatsCard";
import { format } from "date-fns";

/**
 * Props interface for the KeyMetrics component
 */
interface KeyMetricsProps {
  /** Total income amount for the period */
  totalIncome: number;
  /** Total expenses amount for the period */
  totalExpenses: number;
  /** Net savings (income - expenses) for the period */
  netSavings: number;
  /** Start date of the period being analyzed */
  startDate: Date;
  /** End date of the period being analyzed */
  endDate: Date;
}

/**
 * KeyMetrics component displays three key financial metrics in a grid layout:
 * - Total Income with an upward trending arrow
 * - Total Expenses with a downward trending arrow
 * - Net Savings with a banknotes icon and trend direction
 *
 * Each metric is displayed in a StatsCard component with formatted values and
 * appropriate icons. The date range is shown for income and expenses, while
 * net savings shows whether the trend is positive or negative.
 */
export default function KeyMetrics({
  totalIncome,
  totalExpenses,
  netSavings,
  startDate,
  endDate,
}: KeyMetricsProps) {
  // Format the date range for display
  const dateRange = `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Income Stats Card */}
      <StatsCard
        title="Total Income"
        value={`$${totalIncome.toLocaleString()}`}
        icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
        trend={dateRange}
      />
      {/* Expenses Stats Card */}
      <StatsCard
        title="Total Expenses"
        value={`$${totalExpenses.toLocaleString()}`}
        icon={<ArrowTrendingDownIcon className="w-6 h-6" />}
        trend={dateRange}
      />
      {/* Net Savings Stats Card */}
      <StatsCard
        title="Net Savings"
        value={`$${Math.abs(netSavings).toLocaleString()}`}
        icon={<BanknotesIcon className="w-6 h-6" />}
        trend={netSavings >= 0 ? "Positive" : "Negative"}
        trendDirection={netSavings >= 0 ? "up" : "down"}
      />
    </div>
  );
}
