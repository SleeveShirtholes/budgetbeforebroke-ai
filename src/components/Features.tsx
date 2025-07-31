import {
  ChartBarIcon,
  CurrencyDollarIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";

import FeatureCard from "./FeatureCard";

export default function Features() {
  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard
            icon={<ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />}
            title="Smart Budgeting"
            description="Create and manage budgets with our intuitive interface. Track your spending against your budget in real-time with clear visualizations."
          />
          <FeatureCard
            icon={<CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600" />}
            title="Transaction Tracking"
            description="Easily record and categorize your transactions. Get a clear view of your spending patterns and financial habits."
            hoverBorderColor="secondary"
          />
          <FeatureCard
            icon={
              <PresentationChartLineIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            }
            title="Debt Management"
            description="Track and manage your revolving debt with our specialized tools. Create payoff plans and monitor your progress towards becoming debt-free."
          />
        </div>
      </div>
    </div>
  );
}
