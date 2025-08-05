import { render, screen } from "@testing-library/react";
import { jest } from "@jest/globals";
import PaycheckPlanningPage from "../page";

// Mock the hooks and stores
jest.mock("@/hooks/usePaycheckPlanning", () => ({
  usePaycheckPlanning: jest.fn(),
  usePaycheckAllocations: jest.fn(),
}));

jest.mock("@/stores/budgetAccountStore", () => ({
  useBudgetAccount: jest.fn(),
}));

jest.mock("@/components/Toast", () => ({
  useToast: () => ({
    addToast: jest.fn(),
  }),
}));

// Mock the components
jest.mock("../components/PaycheckCard", () => {
  return function MockPaycheckCard() {
    return <div data-testid="paycheck-card">Paycheck Card</div>;
  };
});

jest.mock("../components/DebtManagement", () => {
  return function MockDebtManagement() {
    return <div data-testid="debt-management">Debt Management</div>;
  };
});

jest.mock("../components/WarningsPanel", () => {
  return function MockWarningsPanel() {
    return <div data-testid="warnings-panel">Warnings Panel</div>;
  };
});

jest.mock("../components/MonthSelector", () => {
  return function MockMonthSelector() {
    return <div data-testid="month-selector">Month Selector</div>;
  };
});

describe("PaycheckPlanningPage", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useBudgetAccount: mockUseBudgetAccount } = require("@/stores/budgetAccountStore");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { usePaycheckPlanning: mockUsePaycheckPlanning } = require("@/hooks/usePaycheckPlanning");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { usePaycheckAllocations: mockUsePaycheckAllocations } = require("@/hooks/usePaycheckPlanning");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state correctly", () => {
    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: { id: "account-1", name: "Test Account" },
      isLoading: true,
    });

    mockUsePaycheckPlanning.mockReturnValue({
      planningData: null,
      error: null,
      isLoading: true,
      mutatePlanningData: jest.fn(),
    });

    mockUsePaycheckAllocations.mockReturnValue({
      allocations: null,
      error: null,
      isLoading: true,
    });

    render(<PaycheckPlanningPage />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders no account selected state", () => {
    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: null,
      isLoading: false,
    });

    mockUsePaycheckPlanning.mockReturnValue({
      planningData: null,
      error: null,
      isLoading: false,
      mutatePlanningData: jest.fn(),
    });

    mockUsePaycheckAllocations.mockReturnValue({
      allocations: null,
      error: null,
      isLoading: false,
    });

    render(<PaycheckPlanningPage />);

    expect(screen.getByText("No Budget Account Selected")).toBeInTheDocument();
    expect(screen.getByText("Please select a budget account to view paycheck planning.")).toBeInTheDocument();
  });

  it("renders error state correctly", () => {
    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: { id: "account-1", name: "Test Account" },
      isLoading: false,
    });

    mockUsePaycheckPlanning.mockReturnValue({
      planningData: null,
      error: new Error("Failed to load data"),
      isLoading: false,
      mutatePlanningData: jest.fn(),
    });

    mockUsePaycheckAllocations.mockReturnValue({
      allocations: null,
      error: null,
      isLoading: false,
    });

    render(<PaycheckPlanningPage />);

    expect(screen.getByText("Error Loading Data")).toBeInTheDocument();
    expect(screen.getByText("Failed to load data")).toBeInTheDocument();
  });

  it("renders main content with data", async () => {
    const mockPlanningData = {
      paychecks: [
        {
          id: "paycheck-1",
          name: "Salary",
          amount: 3000,
          date: new Date("2024-01-15"),
          frequency: "bi-weekly" as const,
          userId: "user-1",
        },
      ],
      debts: [
        {
          id: "debt-1",
          name: "Rent",
          amount: 1200,
          dueDate: new Date("2024-01-01"),
          frequency: "monthly",
          isRecurring: true,
        },
      ],
      warnings: [],
    };

    const mockAllocations = [
      {
        paycheckId: "paycheck-1",
        paycheckDate: new Date("2024-01-15"),
        paycheckAmount: 3000,
        allocatedDebts: [
          {
            debtId: "debt-1",
            debtName: "Rent",
            amount: 1200,
            dueDate: new Date("2024-01-01"),
          },
        ],
        remainingAmount: 1800,
      },
    ];

    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: { id: "account-1", name: "Test Account" },
      isLoading: false,
    });

    mockUsePaycheckPlanning.mockReturnValue({
      planningData: mockPlanningData,
      error: null,
      isLoading: false,
      mutatePlanningData: jest.fn(),
    });

    mockUsePaycheckAllocations.mockReturnValue({
      allocations: mockAllocations,
      error: null,
      isLoading: false,
    });

    render(<PaycheckPlanningPage />);

    expect(screen.getByText("Paycheck Planning")).toBeInTheDocument();
    expect(screen.getByText("Plan your paycheck allocation and manage debt payments")).toBeInTheDocument();
    
    // Check summary cards
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("$3,000")).toBeInTheDocument();
    expect(screen.getByText("Total Debts")).toBeInTheDocument();
    expect(screen.getByText("$1,200")).toBeInTheDocument();
    expect(screen.getByText("Remaining")).toBeInTheDocument();
    expect(screen.getByText("$1,800")).toBeInTheDocument();

    // Check that components are rendered
    expect(screen.getByTestId("month-selector")).toBeInTheDocument();
    expect(screen.getByTestId("paycheck-card")).toBeInTheDocument();
    expect(screen.getByTestId("debt-management")).toBeInTheDocument();
  });

  it("renders no paychecks state", () => {
    const mockPlanningData = {
      paychecks: [],
      debts: [],
      warnings: [],
    };

    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: { id: "account-1", name: "Test Account" },
      isLoading: false,
    });

    mockUsePaycheckPlanning.mockReturnValue({
      planningData: mockPlanningData,
      error: null,
      isLoading: false,
      mutatePlanningData: jest.fn(),
    });

    mockUsePaycheckAllocations.mockReturnValue({
      allocations: [],
      error: null,
      isLoading: false,
    });

    render(<PaycheckPlanningPage />);

    expect(screen.getByText("No Paychecks Found")).toBeInTheDocument();
    expect(screen.getByText(/No paychecks are scheduled for/)).toBeInTheDocument();
  });

  it("renders warnings panel when warnings exist", () => {
    const mockPlanningData = {
      paychecks: [],
      debts: [],
      warnings: [
        {
          type: "insufficient_funds" as const,
          message: "Not enough funds",
          severity: "high" as const,
        },
      ],
    };

    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: { id: "account-1", name: "Test Account" },
      isLoading: false,
    });

    mockUsePaycheckPlanning.mockReturnValue({
      planningData: mockPlanningData,
      error: null,
      isLoading: false,
      mutatePlanningData: jest.fn(),
    });

    mockUsePaycheckAllocations.mockReturnValue({
      allocations: [],
      error: null,
      isLoading: false,
    });

    render(<PaycheckPlanningPage />);

    expect(screen.getByTestId("warnings-panel")).toBeInTheDocument();
  });
});