import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

import BudgetCategoriesProgress from "@/components/BudgetCategoriesProgress";
import MonthlySpendingChart from "@/components/MonthlySpendingChart";
import StatsCard from "@/components/StatsCard";

// Mock data - replace with real data from your backend
const monthlySpendingData = [
  { month: "Jan", amount: 1200 },
  { month: "Feb", amount: 1800 },
  { month: "Mar", amount: 1400 },
  { month: "Apr", amount: 900 },
  { month: "May", amount: 1100 },
  { month: "Jun", amount: 1300 },
  { month: "Jul", amount: 1250 },
  { month: "Aug", amount: 1600 },
  { month: "Sep", amount: 1450 },
  { month: "Oct", amount: 1000 },
  { month: "Nov", amount: 1200 },
  { month: "Dec", amount: 1100 },
];

const budgetCategories = [
  { name: "Housing", spent: 1200, budget: 1500, color: "rgb(78, 0, 142)" }, // primary-500
  { name: "Food", spent: 400, budget: 500, color: "rgb(153, 51, 255)" }, // primary-400
  {
    name: "Transportation",
    spent: 200,
    budget: 300,
    color: "rgb(179, 102, 255)",
  }, // primary-300
  {
    name: "Entertainment",
    spent: 150,
    budget: 200,
    color: "rgb(209, 153, 255)",
  }, // primary-200
  { name: "Shopping", spent: 300, budget: 400, color: "rgb(230, 204, 255)" }, // primary-100
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Balance"
          value="$24,000"
          trend="+2.5%"
          trendDirection="up"
          icon={<BanknotesIcon className="w-6 h-6 text-primary-500" />}
        />
        <StatsCard
          title="Income"
          value="$4,200"
          trend="+8.1%"
          trendDirection="up"
          icon={<ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />}
        />
        <StatsCard
          title="Expenses"
          value="$2,800"
          trend="-3.2%"
          trendDirection="down"
          icon={<ArrowTrendingDownIcon className="w-6 h-6 text-red-500" />}
        />
        <StatsCard
          title="Savings"
          value="$1,400"
          trend="+4.3%"
          trendDirection="up"
          icon={<CurrencyDollarIcon className="w-6 h-6 text-primary-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlySpendingChart data={monthlySpendingData} />
        </div>
        <div>
          <BudgetCategoriesProgress categories={budgetCategories} />
        </div>
      </div>
    </div>
  );
}
