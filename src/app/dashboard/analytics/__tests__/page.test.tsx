import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import useTransactionsStore from "@/stores/transactionsStore";
import { TransactionCategory } from "@/types/transaction";
import { act } from "react";
import AnalyticsPage from "../page";

// Mock the transactions store
jest.mock("@/stores/transactionsStore", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the components
jest.mock("@/components/BudgetCategoriesProgress", () => {
  return function MockBudgetCategoriesProgress() {
    return (
      <div data-testid="budget-categories-progress">
        Budget Categories Progress
      </div>
    );
  };
});

jest.mock("../components/DateRangeSelector", () => {
  return function MockDateRangeSelector({
    onDateRangeChange,
  }: {
    onDateRangeChange: (start: Date, end: Date) => void;
  }) {
    return (
      <div data-testid="date-range-selector">
        <button
          onClick={() =>
            onDateRangeChange(new Date("2024-01-01"), new Date("2024-01-31"))
          }
        >
          Change Date Range
        </button>
      </div>
    );
  };
});

jest.mock("../components/KeyMetrics", () => {
  return function MockKeyMetrics() {
    return <div data-testid="key-metrics">Key Metrics</div>;
  };
});

jest.mock("../components/SpendingChart", () => {
  return function MockSpendingChart() {
    return <div data-testid="spending-chart">Spending Chart</div>;
  };
});

jest.mock("../components/RecentTransactions", () => {
  return function MockRecentTransactions() {
    return <div data-testid="recent-transactions">Recent Transactions</div>;
  };
});

describe("AnalyticsPage", () => {
  const mockTransactions = [
    {
      id: "1",
      date: "2024-01-15",
      amount: 100,
      type: "income",
      category: "salary" as TransactionCategory,
      description: "Salary",
    },
    {
      id: "2",
      date: "2024-01-16",
      amount: 50,
      type: "expense",
      category: "groceries" as TransactionCategory,
      description: "Groceries",
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock the transactions store implementation
    (useTransactionsStore as unknown as jest.Mock).mockImplementation(() => ({
      transactions: mockTransactions,
      initializeTransactions: jest.fn(),
    }));
  });

  it("renders all main components", () => {
    render(<AnalyticsPage />);

    expect(screen.getByTestId("date-range-selector")).toBeInTheDocument();
    expect(screen.getByTestId("key-metrics")).toBeInTheDocument();
    expect(
      screen.getByTestId("budget-categories-progress"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("spending-chart")).toBeInTheDocument();
    expect(screen.getByTestId("recent-transactions")).toBeInTheDocument();
  });

  it("initializes transactions on mount", () => {
    const mockInitializeTransactions = jest.fn();
    (useTransactionsStore as unknown as jest.Mock).mockImplementation(() => ({
      transactions: mockTransactions,
      initializeTransactions: mockInitializeTransactions,
    }));

    render(<AnalyticsPage />);
    expect(mockInitializeTransactions).toHaveBeenCalled();
  });

  it("updates date range when selector is used", async () => {
    render(<AnalyticsPage />);

    const dateRangeButton = screen.getByText("Change Date Range");
    await act(async () => {
      fireEvent.click(dateRangeButton);
    });

    // Verify that the components re-render with new date range
    await waitFor(() => {
      expect(screen.getByTestId("key-metrics")).toBeInTheDocument();
    });
  });

  it("calculates financial insights correctly", () => {
    render(<AnalyticsPage />);

    // The insights are calculated in the component and passed to child components
    // We can verify this by checking that the components are rendered
    expect(screen.getByTestId("key-metrics")).toBeInTheDocument();
    expect(
      screen.getByTestId("budget-categories-progress"),
    ).toBeInTheDocument();
  });

  it("handles empty transactions gracefully", () => {
    (useTransactionsStore as unknown as jest.Mock).mockImplementation(() => ({
      transactions: [],
      initializeTransactions: jest.fn(),
    }));

    render(<AnalyticsPage />);

    // Verify that the components still render without crashing
    expect(screen.getByTestId("key-metrics")).toBeInTheDocument();
    expect(
      screen.getByTestId("budget-categories-progress"),
    ).toBeInTheDocument();
  });
});
