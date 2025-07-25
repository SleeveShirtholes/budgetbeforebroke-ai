import { render, screen, waitFor } from "@testing-library/react";

import DashboardPage from "../page";

// Mock the server action
jest.mock("@/app/actions/dashboard", () => ({
  getDashboardData: jest.fn(),
}));

// Mock SWR to avoid actual data fetching in tests
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the child components since we're testing the parent component
jest.mock("@/components/BudgetCategoriesProgress", () => {
  return function MockBudgetCategoriesProgress({
    categories,
  }: {
    categories: unknown[];
  }) {
    return (
      <div data-testid="budget-categories-progress">
        Budget Categories Progress ({categories.length} categories)
      </div>
    );
  };
});

jest.mock("@/components/MonthlySpendingChart", () => {
  return function MockMonthlySpendingChart({ data }: { data: unknown[] }) {
    return (
      <div data-testid="monthly-spending-chart">
        Monthly Spending Chart ({data.length} months)
      </div>
    );
  };
});

jest.mock("@/components/Card", () => {
  return function MockCard({ children }: { children: React.ReactNode }) {
    return <div data-testid="card">{children}</div>;
  };
});

const mockDashboardData = {
  totalBalance: 24000,
  monthlyIncome: 4200,
  monthlyExpenses: 2800,
  monthlySpendingData: [
    { month: "Jan", amount: 1200 },
    { month: "Feb", amount: 1800 },
    { month: "Mar", amount: 1400 },
  ],
  budgetCategories: [
    { name: "Housing", spent: 1600, budget: 1500, color: "rgb(78, 0, 142)" },
    { name: "Food", spent: 400, budget: 500, color: "rgb(153, 51, 255)" },
  ],
};

// Create a test wrapper - we'll mock SWR so don't need actual SWRConfig
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="test-wrapper">{children}</div>
);

describe("DashboardPage", () => {
  const useSWRMock = jest.requireMock("swr").default as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    useSWRMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>,
    );

    // Check for loading skeleton elements
    expect(screen.getAllByTestId("card")).toHaveLength(5); // 3 skeleton cards + 2 chart cards
    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("renders error state", () => {
    const errorMessage = "Failed to fetch dashboard data";
    useSWRMock.mockReturnValue({
      data: undefined,
      error: new Error(errorMessage),
      isLoading: false,
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>,
    );

    expect(
      screen.getByText(`Error loading dashboard data: ${errorMessage}`),
    ).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("renders dashboard data when loaded successfully", async () => {
    useSWRMock.mockReturnValue({
      data: mockDashboardData,
      error: undefined,
      isLoading: false,
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Total Balance")).toBeInTheDocument();
      expect(screen.getByText("$24,000.00")).toBeInTheDocument();
      expect(screen.getByText("Monthly Income")).toBeInTheDocument();
      expect(screen.getByText("$4,200.00")).toBeInTheDocument();
      expect(screen.getByText("Monthly Expenses")).toBeInTheDocument();
      expect(screen.getByText("$2,800.00")).toBeInTheDocument();
    });
  });

  it("renders the budget categories progress component with data", async () => {
    useSWRMock.mockReturnValue({
      data: mockDashboardData,
      error: undefined,
      isLoading: false,
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("budget-categories-progress"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Budget Categories Progress (2 categories)"),
      ).toBeInTheDocument();
    });
  });

  it("renders the monthly spending chart component with data", async () => {
    useSWRMock.mockReturnValue({
      data: mockDashboardData,
      error: undefined,
      isLoading: false,
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("monthly-spending-chart")).toBeInTheDocument();
      expect(
        screen.getByText("Monthly Spending Chart (3 months)"),
      ).toBeInTheDocument();
    });
  });

  it("configures SWR with correct options", () => {
    useSWRMock.mockReturnValue({
      data: mockDashboardData,
      error: undefined,
      isLoading: false,
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>,
    );

    expect(useSWRMock).toHaveBeenCalledWith(
      "dashboard-data",
      expect.any(Function),
      {
        refreshInterval: 30000,
        revalidateOnFocus: true,
      },
    );
  });
});
