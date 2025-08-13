"use client";

import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

import BudgetCategoriesProgress from "@/components/BudgetCategoriesProgress";
import Card from "@/components/Card";
import MonthlySpendingChart from "@/components/MonthlySpendingChart";
import { getDashboardData, type DashboardData } from "@/app/actions/dashboard";
import { needsOnboarding } from "@/app/actions/onboarding";
import Button from "@/components/Button";

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
  const router = useRouter();

  // Check if user needs onboarding on component mount
  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const needsSetup = await needsOnboarding();
        if (needsSetup) {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    }

    checkOnboardingStatus();
  }, [router]);

  // Use mutate from SWR to allow retrying the fetch without a full page reload
  const { data, error, isLoading, mutate } = useSWR(
    "dashboard-data",
    fetchDashboardData,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    },
  );

  // Handle missing budget account error with useEffect to avoid setState during render
  useEffect(() => {
    if (error && error.message?.includes("No default budget account found")) {
      router.replace("/onboarding");
    }
  }, [error, router]);

  if (error) {
    // If error is about missing budget account, show loading state while redirecting
    if (error.message?.includes("No default budget account found")) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Setting up your account...</h2>
            <p className="text-gray-500">Redirecting to complete setup...</p>
          </div>
        </div>
      );
    }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-secondary-600">
                Total Balance
              </h3>
              <p className="mt-2 text-xl sm:text-2xl font-semibold text-secondary-900 truncate">
                ${formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-primary-50 rounded-lg flex-shrink-0">
              <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-secondary-600">
                Monthly Income
              </h3>
              <p className="mt-2 text-xl sm:text-2xl font-semibold text-green-600 truncate">
                ${formatCurrency(monthlyIncome)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg flex-shrink-0">
              <ArrowTrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-secondary-600">
                Monthly Expenses
              </h3>
              <p className="mt-2 text-xl sm:text-2xl font-semibold text-red-600 truncate">
                ${formatCurrency(monthlyExpenses)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-50 rounded-lg flex-shrink-0">
              <ArrowTrendingDownIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          {budgetCategories.length > 0 ? (
            <BudgetCategoriesProgress categories={budgetCategories} />
          ) : (
            <Card>
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Set Up Your Budget
                  </h3>
                  <p className="text-secondary-600 mb-6">
                    Create budget categories to track your spending and stay on
                    top of your finances.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push("/dashboard/budgets")}
                  >
                    Set Up Budget Categories
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
        <div className="lg:col-span-2 order-1 lg:order-2">
          <MonthlySpendingChart data={monthlySpendingData} />
        </div>
      </div>
    </div>
  );
}
