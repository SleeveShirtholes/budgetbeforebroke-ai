"use client";

import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { useEffect, useMemo, useState } from "react";

import BudgetCategoriesProgress from "@/components/BudgetCategoriesProgress";
import DateRangeSelector from "@/app/dashboard/analytics/components/DateRangeSelector";
import KeyMetrics from "@/app/dashboard/analytics/components/KeyMetrics";
import RecentTransactions from "./components/RecentTransactions";
import SpendingChart from "@/app/dashboard/analytics/components/SpendingChart";
import { TransactionCategory } from "@/types/transaction";
import useTransactionsStore from "@/stores/transactionsStore";

// Define possible chart view modes
type ChartViewMode = "total" | "byCategory" | "incomeVsExpense";

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
  // State management
  const { transactions, initializeTransactions } = useTransactionsStore();
  const [selectedCategories, setSelectedCategories] = useState<
    Set<TransactionCategory>
  >(new Set());
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>("total");
  const [selectedChartCategories, setSelectedChartCategories] = useState<
    Set<TransactionCategory>
  >(new Set());
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });

  // Load transactions on component mount
  useEffect(() => {
    initializeTransactions();
  }, [initializeTransactions]);

  // Calculate financial insights for the selected date range
  const insights = useMemo(() => {
    // Filter transactions within the selected date range
    const timeframeTransactions = transactions.filter(
      (t) =>
        new Date(t.date) >= dateRange.startDate &&
        new Date(t.date) <= dateRange.endDate,
    );

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

    // Calculate spending by category
    const categorySpending = timeframeTransactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        },
        {} as Record<TransactionCategory, number>,
      );

    // Get top 5 spending categories
    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        name: category,
        spent: amount,
        budget: amount * 1.2, // Example budget calculation
        color: "#4e008e", // primary-500
      }));

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      topCategories,
    };
  }, [transactions, dateRange]);

  // Category selection handlers for transactions list
  const handleCategoryToggle = (category: TransactionCategory) => {
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
  const handleChartCategoryToggle = (category: TransactionCategory) => {
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

  // Prepare chart data based on selected view mode
  const chartData = useMemo(() => {
    const timeframeTransactions = transactions.filter(
      (t) =>
        new Date(t.date) >= dateRange.startDate &&
        new Date(t.date) <= dateRange.endDate,
    );

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
              if (!acc[t.category]) {
                acc[t.category] = {};
              }
              acc[t.category][day] = (acc[t.category][day] || 0) + t.amount;
              return acc;
            },
            {} as Record<string, Record<string, number>>,
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
        const filteredTransactions = timeframeTransactions.filter(
          (t) =>
            t.type === "expense" &&
            (!selectedCategories.size || selectedCategories.has(t.category)),
        );

        // Group by day
        const dailyData = filteredTransactions.reduce(
          (acc, t) => {
            const day = format(new Date(t.date), "MMM d");
            acc[day] = (acc[day] || 0) + t.amount;
            return acc;
          },
          {} as Record<string, number>,
        );

        // Convert to chart data format with primary color theme
        return {
          data: days.map((day) => ({
            month: day,
            amount: dailyData[day] || 0,
          })),
          datasets: [
            {
              label: selectedCategories.size
                ? Array.from(selectedCategories)[0]
                : "Total Spending",
              data: days.map((day) => dailyData[day] || 0),
              borderColor: "#4e008e", // primary-500
              backgroundColor: "rgba(78, 0, 142, 0.1)", // primary-500 with opacity
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "#4e008e",
              pointBorderColor: "#4e008e",
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        };
      }
    }
  }, [
    transactions,
    selectedCategories,
    chartViewMode,
    selectedChartCategories,
    dateRange,
  ]);

  // Filter transactions for the recent transactions list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          new Date(t.date) >= dateRange.startDate &&
          new Date(t.date) <= dateRange.endDate &&
          (!selectedCategories.size || selectedCategories.has(t.category)),
      )
      .slice(0, 10);
  }, [transactions, selectedCategories, dateRange]);

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
        />
        <KeyMetrics
          totalIncome={insights.totalIncome}
          totalExpenses={insights.totalExpenses}
          netSavings={insights.netSavings}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
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
        />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={filteredTransactions} />
    </div>
  );
}
