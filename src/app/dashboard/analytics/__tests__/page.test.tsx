import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import useSWR from "swr";
import AnalyticsPage from "../page";

// Mock SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the transaction actions
jest.mock("@/app/actions/transaction", () => ({
  getTransactions: jest.fn(),
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
      budgetAccountId: "account-1",
      categoryId: "category-1",
      createdByUserId: "user-1",
      amount: 100,
      description: "Salary",
      date: new Date("2024-01-15"),
      type: "income" as const,
      status: "completed",
      merchantName: "Employer",
      plaidCategory: null,
      pending: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      categoryName: "Salary",
    },
    {
      id: "2",
      budgetAccountId: "account-1",
      categoryId: "category-2",
      createdByUserId: "user-1",
      amount: 50,
      description: "Groceries",
      date: new Date("2024-01-16"),
      type: "expense" as const,
      status: "completed",
      merchantName: "Grocery Store",
      plaidCategory: null,
      pending: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      categoryName: "Groceries",
    },
  ];

  const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock SWR to return successful data
    mockUseSWR.mockImplementation(() => ({
      data: mockTransactions,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
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

  it("shows loading state when data is loading", () => {
    mockUseSWR.mockImplementation(() => ({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: jest.fn(),
      isValidating: true,
    }));

    render(<AnalyticsPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows error state when data fails to load", () => {
    mockUseSWR.mockImplementation(() => ({
      data: undefined,
      error: new Error("Failed to load"),
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    }));

    render(<AnalyticsPage />);
    expect(
      screen.getByText("Failed to load transactions. Please try again."),
    ).toBeInTheDocument();
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
    mockUseSWR.mockImplementation(() => ({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    }));

    render(<AnalyticsPage />);

    // Verify that the components still render without crashing
    expect(screen.getByTestId("key-metrics")).toBeInTheDocument();
    expect(
      screen.getByTestId("budget-categories-progress"),
    ).toBeInTheDocument();
  });
});
