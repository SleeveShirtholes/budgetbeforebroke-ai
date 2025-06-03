import { render, screen } from "@testing-library/react";

import DashboardPage from "../page";

// Mock the child components since we're testing the parent component
jest.mock("@/components/BudgetCategoriesProgress", () => {
  return function MockBudgetCategoriesProgress() {
    return (
      <div data-testid="budget-categories-progress">
        Budget Categories Progress
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

jest.mock("@/components/Card", () => {
  return function MockCard({ children }: { children: React.ReactNode }) {
    return <div data-testid="card">{children}</div>;
  };
});

describe("DashboardPage", () => {
  it("renders the total balance card with correct amount", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Total Balance")).toBeInTheDocument();
    expect(screen.getByText("$24,000.00")).toBeInTheDocument();
  });

  it("renders the monthly income card with correct amount", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Monthly Income")).toBeInTheDocument();
    expect(screen.getByText("$4,200.00")).toBeInTheDocument();
  });

  it("renders the monthly expenses card with correct amount", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Monthly Expenses")).toBeInTheDocument();
    expect(screen.getByText("$2,800.00")).toBeInTheDocument();
  });

  it("renders the budget categories progress component", () => {
    render(<DashboardPage />);
    expect(
      screen.getByTestId("budget-categories-progress"),
    ).toBeInTheDocument();
  });

  it("renders the monthly spending chart component", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("monthly-spending-chart")).toBeInTheDocument();
  });

  it("renders all three overview cards", () => {
    render(<DashboardPage />);
    const cards = screen.getAllByTestId("card");
    expect(cards).toHaveLength(3);
  });
});
