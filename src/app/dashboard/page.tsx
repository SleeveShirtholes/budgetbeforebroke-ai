import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

import BudgetCategoriesProgress from "@/components/BudgetCategoriesProgress";
import Card from "@/components/Card";
import MonthlySpendingChart from "@/components/MonthlySpendingChart";

// Format number as currency string
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Mock data - replace with real data from your backend
const totalBalance = 24000;
const monthlyIncome = 4200;
const monthlyExpenses = 2800;

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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-secondary-600">
                Total Balance
              </h3>
              <p className="mt-2 text-2xl font-semibold text-secondary-900">
                ${formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-secondary-600">
                Monthly Income
              </h3>
              <p className="mt-2 text-2xl font-semibold text-green-600">
                ${formatCurrency(monthlyIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-secondary-600">
                Monthly Expenses
              </h3>
              <p className="mt-2 text-2xl font-semibold text-red-600">
                ${formatCurrency(monthlyExpenses)}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
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
