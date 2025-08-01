"use client";

import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { useMemo, useState } from "react";
import useSWR from "swr";

import BudgetCategoriesProgress from "@/components/BudgetCategoriesProgress";
import DateRangeSelector from "@/app/dashboard/analytics/components/DateRangeSelector";
import KeyMetrics from "@/app/dashboard/analytics/components/KeyMetrics";
import RecentTransactions from "./components/RecentTransactions";
import SpendingChart from "@/app/dashboard/analytics/components/SpendingChart";
import { getTransactions } from "@/app/actions/transaction";
import { getBudgetCategoriesWithSpendingForDateRange } from "@/app/actions/dashboard";
import Spinner from "@/components/Spinner";
import { TransactionCategory } from "@/types/transaction";
import { useBudgetAccount } from "@/stores/budgetAccountStore";

// Define possible chart view modes
type ChartViewMode = "total" | "byCategory" | "incomeVsExpense";

/**
 * Helper function to convert string category names to TransactionCategory type
 * Falls back to "Other" if the category name doesn't match any known category
 */
function mapCategoryNameToType(
  categoryName: string | null | undefined,
): TransactionCategory {
  if (!categoryName) return "Other";

  // Map common category names to TransactionCategory values
  const categoryMap: Record<string, TransactionCategory> = {
    Housing: "Housing",
    Transportation: "Transportation",
    Food: "Food",
    Utilities: "Utilities",
    Insurance: "Insurance",
    Healthcare: "Healthcare",
    Savings: "Savings",
    Personal: "Personal",
    Entertainment: "Entertainment",
    Debt: "Debt",
    Income: "Income",
    Other: "Other",
  };

  return categoryMap[categoryName] || "Other";
}

/**
 * Analytics Dashboard Page Component
 *
 * This component provides a comprehensive financial analytics dashboard that includes:
 * - Date range selection for filtering data
 * - Key financial metrics (income, expenses, savings)
 * - Interactive spending charts with multiple view modes
 * - Budget category progress tracking
 * - Recent transactions list
 *
 * The dashboard supports filtering by date range and transaction categories,
 * and offers different chart visualization modes for analyzing spending patterns.
 */
export default function AnalyticsPage() {
  // Get the currently selected budget account
  const { selectedAccount, isLoading: isAccountsLoading } = useBudgetAccount();

  // State management
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>("total");
  const [selectedChartCategories, setSelectedChartCategories] = useState<
    Set<string>
  >(new Set());
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });

  // Fetch transactions using SWR
  const {
    data: transactions = [],
    error: transactionsError,
    isLoading: isTransactionsLoading,
  } = useSWR(
    selectedAccount ? ["transactions", selectedAccount.id] : null,
    () => getTransactions(selectedAccount!.id),
  );

  // Fetch budget categories with spending data using SWR
  const {
    data: budgetCategories = [],
    error: categoriesError,
    isLoading: isCategoriesLoading,
  } = useSWR(
    selectedAccount
      ? [
          "budget-categories",
          selectedAccount.id,
          dateRange.startDate,
          dateRange.endDate,
        ]
      : null,
    () =>
      getBudgetCategoriesWithSpendingForDateRange(
        selectedAccount!.id,
        dateRange.startDate,
        dateRange.endDate,
      ),
  );

  // Calculate financial insights for the selected date range
  const insights = useMemo(() => {
    // Filter transactions within the selected date range
    const timeframeTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const startOfTransactionDate = new Date(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        transactionDate.getDate(),
      );
      const startOfStartDate = new Date(
        dateRange.startDate.getFullYear(),
        dateRange.startDate.getMonth(),
        dateRange.startDate.getDate(),
      );
      const startOfEndDate = new Date(
        dateRange.endDate.getFullYear(),
        dateRange.endDate.getMonth(),
        dateRange.endDate.getDate(),
      );

      return (
        startOfTransactionDate >= startOfStartDate &&
        startOfTransactionDate <= startOfEndDate
      );
    });

    // Calculate total income
    const totalIncome = timeframeTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total expenses
    const totalExpenses = timeframeTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate net savings
    const netSavings = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      topCategories: budgetCategories,
    };
  }, [transactions, budgetCategories, dateRange]);

  // Prepare chart data based on selected view mode
  const chartData = useMemo(() => {
    const timeframeTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const startOfTransactionDate = new Date(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        transactionDate.getDate(),
      );
      const startOfStartDate = new Date(
        dateRange.startDate.getFullYear(),
        dateRange.startDate.getMonth(),
        dateRange.startDate.getDate(),
      );
      const startOfEndDate = new Date(
        dateRange.endDate.getFullYear(),
        dateRange.endDate.getMonth(),
        dateRange.endDate.getDate(),
      );

      return (
        startOfTransactionDate >= startOfStartDate &&
        startOfTransactionDate <= startOfEndDate
      );
    });

    // Generate array of days in the selected date range
    const days = eachDayOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate,
    }).map((date) => format(date, "MMM d"));

    switch (chartViewMode) {
      case "byCategory": {
        // Group transactions by category and day
        const categoryData = timeframeTransactions
          .filter((t) => t.type === "expense")
          .reduce(
            (acc, t) => {
              const day = format(new Date(t.date), "MMM d");
              const categoryName = mapCategoryNameToType(t.categoryName);
              if (!acc[categoryName]) {
                acc[categoryName] = {};
              }
              acc[categoryName][day] = (acc[categoryName][day] || 0) + t.amount;
              return acc;
            },
            {} as Record<TransactionCategory, Record<string, number>>,
          );

        // Convert to chart data format with dynamic colors for each category
        return {
          data: days.map((day) => ({
            month: day,
            amount: 0, // This will be ignored since we're using datasets
          })),
          datasets: Object.entries(categoryData)
            .filter(
              ([category]) =>
                selectedChartCategories.size === 0 ||
                selectedChartCategories.has(category as TransactionCategory),
            )
            .map(([category, dayData], index) => ({
              label: category,
              data: days.map((day) => dayData[day] || 0),
              borderColor: `hsl(${index * 120}, 70%, 50%)`,
              backgroundColor: `hsla(${index * 120}, 70%, 50%, 0.1)`,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: `hsl(${index * 120}, 70%, 50%)`,
              pointBorderColor: `hsl(${index * 120}, 70%, 50%)`,
              pointRadius: 4,
              pointHoverRadius: 6,
            })),
        };
      }

      case "incomeVsExpense": {
        // Group transactions by type (income/expense) and day
        const typeData = timeframeTransactions.reduce(
          (acc, t) => {
            const day = format(new Date(t.date), "MMM d");
            if (!acc[t.type]) {
              acc[t.type] = {};
            }
            acc[t.type][day] = (acc[t.type][day] || 0) + t.amount;
            return acc;
          },
          {} as Record<string, Record<string, number>>,
        );

        // Convert to chart data format with income/expense colors
        return {
          data: days.map((day) => ({
            month: day,
            amount: 0, // This will be ignored since we're using datasets
          })),
          datasets: [
            {
              label: "Income",
              data: days.map((day) => typeData.income?.[day] || 0),
              borderColor: "#22c55e", // green-500
              backgroundColor: "rgba(34, 197, 94, 0.1)", // green-500 with opacity
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "#22c55e",
              pointBorderColor: "#22c55e",
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: "Expenses",
              data: days.map((day) => typeData.expense?.[day] || 0),
              borderColor: "#ef4444", // red-500
              backgroundColor: "rgba(239, 68, 68, 0.1)", // red-500 with opacity
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "#ef4444",
              pointBorderColor: "#ef4444",
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        };
      }

      case "total":
      default: {
        // Filter transactions by selected category if any
        const filteredTransactions =
          selectedChartCategories.size > 0
            ? timeframeTransactions.filter((t) =>
                selectedChartCategories.has(
                  mapCategoryNameToType(t.categoryName),
                ),
              )
            : timeframeTransactions;

        // Group by day and calculate total spending
        const dailySpending = filteredTransactions
          .filter((t) => t.type === "expense")
          .reduce(
            (acc, t) => {
              const day = format(new Date(t.date), "MMM d");
              acc[day] = (acc[day] || 0) + t.amount;
              return acc;
            },
            {} as Record<string, number>,
          );

        // Create chart data with all days in range, filling in zeros for days with no spending
        const chartData = {
          data: days.map((day) => ({
            month: day,
            amount: dailySpending[day] || 0,
          })),
          datasets: [
            {
              label: "Daily Spending",
              data: days.map((day) => dailySpending[day] || 0),
              borderColor: "#4e008e", // primary-500
              backgroundColor: "rgba(78, 0, 142, 0.1)", // primary-500 with opacity
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "#4e008e", // primary-500
              pointBorderColor: "#4e008e", // primary-500
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        };

        return chartData;
      }
    }
  }, [transactions, dateRange, chartViewMode, selectedChartCategories]);

  // Filter transactions for the recent transactions list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        const startOfTransactionDate = new Date(
          transactionDate.getFullYear(),
          transactionDate.getMonth(),
          transactionDate.getDate(),
        );
        const startOfStartDate = new Date(
          dateRange.startDate.getFullYear(),
          dateRange.startDate.getMonth(),
          dateRange.startDate.getDate(),
        );
        const startOfEndDate = new Date(
          dateRange.endDate.getFullYear(),
          dateRange.endDate.getMonth(),
          dateRange.endDate.getDate(),
        );

        return (
          startOfTransactionDate >= startOfStartDate &&
          startOfTransactionDate <= startOfEndDate &&
          (!selectedCategories.size ||
            selectedCategories.has(mapCategoryNameToType(t.categoryName)))
        );
      })
      .slice(0, 10);
  }, [transactions, selectedCategories, dateRange]);

  // Show loading state only for initial load
  if (isAccountsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (transactionsError || categoriesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load data. Please try again.</p>
      </div>
    );
  }

  // Show message if no account is selected
  if (!selectedAccount) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Budget Account Selected
          </h3>
          <p className="text-gray-600 mb-6">
            To view your financial analytics, you need to select or create a
            budget account.
          </p>
          <div className="space-y-3">
            <a
              href="/account"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Manage Accounts
            </a>
            <div className="text-sm text-gray-500">
              <p>Don&apos;t have an account yet?</p>
              <a
                href="/onboarding/account"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Create your first budget account
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Category selection handlers for transactions list
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const clearCategorySelection = () => {
    setSelectedCategories(new Set());
  };

  // Category selection handlers for chart
  const handleChartCategoryToggle = (category: string) => {
    setSelectedChartCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const clearChartSelection = () => {
    setSelectedChartCategories(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics with Date Range */}
      <div className="space-y-4">
        <DateRangeSelector
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateRangeChange={(startDate, endDate) =>
            setDateRange({ startDate, endDate })
          }
          isLoading={isTransactionsLoading || isCategoriesLoading}
        />
        <KeyMetrics
          totalIncome={insights.totalIncome}
          totalExpenses={insights.totalExpenses}
          netSavings={insights.netSavings}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          isLoading={isTransactionsLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetCategoriesProgress
          categories={insights.topCategories}
          onCategoryClick={handleCategoryToggle}
          selectedCategories={selectedCategories}
          onClearSelection={clearCategorySelection}
          chartViewMode={chartViewMode}
          selectedChartCategories={selectedChartCategories}
          onChartCategoryToggle={handleChartCategoryToggle}
          onClearChartSelection={clearChartSelection}
          isLoading={isCategoriesLoading}
        />
        <SpendingChart
          chartData={chartData}
          chartViewMode={chartViewMode}
          selectedCategories={selectedCategories}
          onChartViewModeChange={(mode) => {
            setChartViewMode(mode);
            if (mode !== "byCategory") {
              setSelectedChartCategories(new Set());
            }
          }}
          isLoading={isTransactionsLoading || isCategoriesLoading}
        />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={filteredTransactions}
        isLoading={isTransactionsLoading}
      />
    </div>
  );
}
