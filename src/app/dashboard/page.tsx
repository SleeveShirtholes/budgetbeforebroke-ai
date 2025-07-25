"use client";

import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import useSWR from "swr";

import BudgetCategoriesProgress from "@/components/BudgetCategoriesProgress";
import Card from "@/components/Card";
import MonthlySpendingChart from "@/components/MonthlySpendingChart";
import { getDashboardData, type DashboardData } from "@/app/actions/dashboard";

// Format number as currency string
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// SWR fetcher function for dashboard data
const fetchDashboardData = async (): Promise<DashboardData> => {
  return await getDashboardData();
};

export default function DashboardPage() {
  // Use mutate from SWR to allow retrying the fetch without a full page reload
  const { data, error, isLoading, mutate } = useSWR(
    "dashboard-data",
    fetchDashboardData,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    },
  );

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600">
              Error loading dashboard data: {error.message}
            </p>
            {/* Use SWR's mutate to retry fetching dashboard data instead of reloading the page */}
            <button
              onClick={() => mutate()}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for overview cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg animate-pulse">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Loading skeleton for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </Card>
          <div className="lg:col-span-2">
            <Card>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySpendingData,
    budgetCategories,
  } = data!;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <div>
          <BudgetCategoriesProgress categories={budgetCategories} />
        </div>
        <div className="lg:col-span-2">
          <MonthlySpendingChart data={monthlySpendingData} />
        </div>
      </div>
    </div>
  );
}
