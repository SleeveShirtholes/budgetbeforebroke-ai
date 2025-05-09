import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";

import Card from "./Card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: "up" | "down";
}

/**
 * StatsCard Component
 *
 * A reusable card component that displays a statistic with an optional icon and trend indicator.
 * Used for displaying key metrics and statistics in a visually appealing way.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - The title/label of the statistic
 * @param {string|number} props.value - The main value to display
 * @param {React.ReactNode} [props.icon] - Optional icon to display alongside the statistic
 * @param {string} [props.trend] - Optional trend value to display (e.g., "+12%")
 * @param {"up"|"down"} [props.trendDirection] - Direction of the trend, determines color and arrow icon
 * @returns {JSX.Element} A card displaying the statistic with optional trend information
 */
export default function StatsCard({
  title,
  value,
  icon,
  trend,
  trendDirection,
}: StatsCardProps) {
  return (
    <Card variant="default">
      {/* Main content container with title, value, and optional icon */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-secondary-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-secondary-900">
            {value}
          </p>
        </div>
        {/* Optional icon display with background styling */}
        {icon && (
          <div className="w-12 h-12 bg-secondary-50 rounded-full flex items-center justify-center text-secondary-500 ring-4 ring-secondary-100">
            {icon}
          </div>
        )}
      </div>
      {/* Optional trend indicator with directional arrow */}
      {trend && (
        <div className="mt-4">
          <div
            className={`flex items-center text-sm ${
              trendDirection === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            <span className="font-medium">{trend}</span>
            {trendDirection === "up" ? (
              <ArrowUpIcon className="w-4 h-4 ml-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 ml-1" />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
