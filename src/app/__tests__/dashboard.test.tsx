import { render, screen } from "@testing-library/react";

import DashboardPage from "../dashboard/page";

// Mock the components used in the dashboard
jest.mock("@/components/StatsCard", () => {
  return function MockStatsCard({
    title,
    value,
  }: {
    title: string;
    value: string;
  }) {
    return (
      <div data-testid="stats-card">
        <div>{title}</div>
        <div>{value}</div>
      </div>
    );
  };
});

jest.mock("@/components/MonthlySpendingChart", () => {
  return function MockMonthlySpendingChart() {
    return (
      <div data-testid="monthly-spending-chart">Monthly Spending Chart</div>
    );
  };
});

jest.mock("@/components/BudgetCategoriesProgress", () => {
  return function MockBudgetCategoriesProgress() {
    return (
      <div data-testid="budget-categories-progress">
        Budget Categories Progress
      </div>
    );
  };
});

describe("Dashboard Page", () => {
  it("renders all stats cards with correct data", () => {
    const { container } = render(<DashboardPage />);

    // Check for the number of cards
    const cards = container.querySelectorAll(".rounded-xl.shadow.bg-white");
    expect(cards).toHaveLength(3);

    // Check for specific stats card content
    expect(screen.getByText("Total Balance")).toBeInTheDocument();
    expect(screen.getByText("$24,000.00")).toBeInTheDocument();
    expect(screen.getByText("Monthly Income")).toBeInTheDocument();
    expect(screen.getByText("$4,200.00")).toBeInTheDocument();
    expect(screen.getByText("Monthly Expenses")).toBeInTheDocument();
    expect(screen.getByText("$2,800.00")).toBeInTheDocument();
  });

  it("renders the monthly spending chart", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("monthly-spending-chart")).toBeInTheDocument();
  });

  it("renders the budget categories progress", () => {
    render(<DashboardPage />);
    expect(
      screen.getByTestId("budget-categories-progress"),
    ).toBeInTheDocument();
  });

  it("renders with the correct layout structure", () => {
    const { container } = render(<DashboardPage />);

    // Check for grid layouts
    expect(
      container.querySelector(".grid-cols-1.md\\:grid-cols-3"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".grid-cols-1.lg\\:grid-cols-3"),
    ).toBeInTheDocument();
  });
});
