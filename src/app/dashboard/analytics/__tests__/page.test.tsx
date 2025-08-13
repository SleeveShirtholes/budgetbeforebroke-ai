/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen, waitFor } from "@testing-library/react";

import { ToastProvider } from "@/components/Toast";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import AnalyticsPage from "../page";

// Mock SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the budget account store
jest.mock("@/stores/budgetAccountStore", () => ({
  useBudgetAccount: jest.fn(),
}));

// Mock the dashboard actions
jest.mock("@/app/actions/dashboard", () => ({
  getBudgetCategoriesWithSpendingForDateRange: jest.fn(),
}));

// Mock the transaction actions
jest.mock("@/app/actions/transaction", () => ({
  getTransactions: jest.fn(),
}));

const mockSWR = require("swr").default;
const mockUseBudgetAccount = useBudgetAccount as jest.MockedFunction<
  typeof useBudgetAccount
>;

describe("AnalyticsPage", () => {
  const mockAccount = {
    id: "test-account-id",
    accountNumber: "TEST-1234",
    nickname: "Test Account",
    users: [
      {
        id: "user1",
        email: "test@example.com",
        name: "Test User",
        role: "owner" as const,
        avatar: undefined,
        accepted: true,
      },
    ],
    invitations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockTransactions = [
    {
      id: "1",
      budgetAccountId: "test-account-id",
      categoryId: "cat1",
      createdByUserId: "user1",
      amount: 100,
      description: "Test transaction",
      date: new Date("2025-06-15"),
      type: "expense" as const,
      status: "completed",
      merchantName: "Test Merchant",
      pending: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      categoryName: "Food",
    },
  ];

  const mockBudgetCategories = [
    {
      name: "Food",
      spent: 100,
      budget: 500,
      color: "#4e008e",
    },
    {
      name: "Transportation",
      spent: 50,
      budget: 200,
      color: "#9933ff",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state when accounts are loading", () => {
    // Mock SWR to return loading state
    mockSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    });

    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: null,
      accounts: [],
      isLoading: true,
      error: null,
      setSelectedAccount: jest.fn(),
      setAccounts: jest.fn(),
      setIsLoading: jest.fn(),
      setError: jest.fn(),
    });

    render(
      <ToastProvider>
        <AnalyticsPage />
      </ToastProvider>,
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows message when no account is selected", () => {
    // Mock SWR to return empty data
    mockSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    });

    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: null,
      accounts: [],
      isLoading: false,
      error: null,
      setSelectedAccount: jest.fn(),
      setAccounts: jest.fn(),
      setIsLoading: jest.fn(),
      setError: jest.fn(),
    });

    render(
      <ToastProvider>
        <AnalyticsPage />
      </ToastProvider>,
    );

    expect(screen.getByText("No Budget Account Selected")).toBeInTheDocument();
    expect(
      screen.getByText(
        "To view your financial analytics, you need to select or create a budget account.",
      ),
    ).toBeInTheDocument();
  });

  it("shows error message when transactions fail to load", () => {
    // Mock SWR to return error for first call, success for second
    mockSWR
      .mockReturnValueOnce({
        data: undefined,
        error: new Error("Failed to load transactions"),
        isLoading: false,
      })
      .mockReturnValueOnce({
        data: mockBudgetCategories,
        error: null,
        isLoading: false,
      });

    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: mockAccount,
      accounts: [mockAccount],
      isLoading: false,
      error: null,
      setSelectedAccount: jest.fn(),
      setAccounts: jest.fn(),
      setIsLoading: jest.fn(),
      setError: jest.fn(),
    });

    render(
      <ToastProvider>
        <AnalyticsPage />
      </ToastProvider>,
    );

    expect(
      screen.getByText("Failed to load data. Please try again."),
    ).toBeInTheDocument();
  });

  it("renders analytics dashboard with data when account is selected", async () => {
    // Mock SWR to return success data
    mockSWR
      .mockReturnValueOnce({
        data: mockTransactions,
        error: null,
        isLoading: false,
      })
      .mockReturnValueOnce({
        data: mockBudgetCategories,
        error: null,
        isLoading: false,
      });

    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: mockAccount,
      accounts: [mockAccount],
      isLoading: false,
      error: null,
      setSelectedAccount: jest.fn(),
      setAccounts: jest.fn(),
      setIsLoading: jest.fn(),
      setError: jest.fn(),
    });

    render(
      <ToastProvider>
        <AnalyticsPage />
      </ToastProvider>,
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText("Budget Categories")).toBeInTheDocument();
    });

    // Check that budget categories are displayed
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Transportation")).toBeInTheDocument();
    expect(screen.getByText("$100.00 / $500.00")).toBeInTheDocument();
    expect(screen.getByText("$50.00 / $200.00")).toBeInTheDocument();
  });

  it("fetches data with correct account ID and date range", () => {
    // Mock SWR to return success data
    mockSWR
      .mockReturnValueOnce({
        data: mockTransactions,
        error: null,
        isLoading: false,
      })
      .mockReturnValueOnce({
        data: mockBudgetCategories,
        error: null,
        isLoading: false,
      });

    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: mockAccount,
      accounts: [mockAccount],
      isLoading: false,
      error: null,
      setSelectedAccount: jest.fn(),
      setAccounts: jest.fn(),
      setIsLoading: jest.fn(),
      setError: jest.fn(),
    });

    render(
      <ToastProvider>
        <AnalyticsPage />
      </ToastProvider>,
    );

    // Verify that SWR was called with the correct keys
    expect(mockSWR).toHaveBeenCalledWith(
      ["transactions", "test-account-id"],
      expect.any(Function),
    );
    expect(mockSWR).toHaveBeenCalledWith(
      [
        "budget-categories",
        "test-account-id",
        expect.any(Date),
        expect.any(Date),
      ],
      expect.any(Function),
    );
  });

  it("shows loading states in individual components when data is loading", () => {
    // Mock SWR to return loading state for transactions, success for categories
    mockSWR
      .mockReturnValueOnce({
        data: undefined,
        error: null,
        isLoading: true,
      })
      .mockReturnValueOnce({
        data: mockBudgetCategories,
        error: null,
        isLoading: false,
      });

    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: mockAccount,
      accounts: [mockAccount],
      isLoading: false,
      error: null,
      setSelectedAccount: jest.fn(),
      setAccounts: jest.fn(),
      setIsLoading: jest.fn(),
      setError: jest.fn(),
    });

    render(
      <ToastProvider>
        <AnalyticsPage />
      </ToastProvider>,
    );

    // The page should render (not show full page loading) but individual components should show loading states
    // We should see multiple spinners for different components
    const spinners = screen.getAllByTestId("spinner");
    expect(spinners.length).toBeGreaterThan(0); // Should have spinners in individual components
  });
});
