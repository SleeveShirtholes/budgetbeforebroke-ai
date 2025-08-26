import React from "react";
import { render, screen } from "@testing-library/react";
import PaycheckPlanningPage from "../page";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import {
  useDebtAllocationManager,
  useHiddenMonthlyDebts,
} from "@/hooks/usePaycheckPlanning";

// Mock the stores and hooks
jest.mock("@/stores/budgetAccountStore");
jest.mock("@/hooks/usePaycheckPlanning");
jest.mock("@/components/Toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

// Mock the actions
jest.mock("@/app/actions/paycheck-planning", () => ({
  markPaymentAsPaid: jest.fn(),
  populateMonthlyDebtPlanning: jest.fn(),
  getDebtAllocations: jest.fn().mockResolvedValue([]),
  setMonthlyDebtPlanningActive: jest.fn(),
}));

// Mock the date utility
jest.mock("@/utils/date", () => ({
  formatDateSafely: jest.fn(() => "Jan 01, 2024"),
}));

const mockUseBudgetAccount = useBudgetAccount as jest.MockedFunction<
  typeof useBudgetAccount
>;
const mockUseDebtAllocationManager =
  useDebtAllocationManager as jest.MockedFunction<
    typeof useDebtAllocationManager
  >;
const mockUseHiddenMonthlyDebts = useHiddenMonthlyDebts as jest.MockedFunction<
  typeof useHiddenMonthlyDebts
>;

describe("PaycheckPlanningPage", () => {
  const mockAccount = {
    id: "account-1",
    accountNumber: "123456",
    nickname: "Test Account",
    users: [],
    invitations: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
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

    mockUseDebtAllocationManager.mockReturnValue({
      planningData: undefined,
      allocations: undefined,
      handleDebtAllocated: jest.fn(),
      handleDebtUnallocated: jest.fn(),
      mutatePlanningData: jest.fn(),
      mutateAllocations: jest.fn(),
      isLoading: false,
    });

    mockUseHiddenMonthlyDebts.mockReturnValue({
      hiddenDebts: undefined,
      mutateHiddenDebts: jest.fn(),
      isLoading: false,
      error: null,
    });
  });

  it("shows loading spinner when accounts are loading", () => {
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

    render(<PaycheckPlanningPage />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows loading spinner when planning data is loading", () => {
    mockUseDebtAllocationManager.mockReturnValue({
      planningData: undefined,
      allocations: undefined,
      handleDebtAllocated: jest.fn(),
      handleDebtUnallocated: jest.fn(),
      mutatePlanningData: jest.fn(),
      mutateAllocations: jest.fn(),
      isLoading: true,
    });

    render(<PaycheckPlanningPage />);

    expect(
      screen.getByText("Loading paycheck planning data..."),
    ).toBeInTheDocument();
  });

  it("shows loading spinner when hidden debts are loading", () => {
    mockUseHiddenMonthlyDebts.mockReturnValue({
      hiddenDebts: undefined,
      mutateHiddenDebts: jest.fn(),
      isLoading: true,
      error: null,
    });

    render(<PaycheckPlanningPage />);

    expect(
      screen.getByText("Loading paycheck planning data..."),
    ).toBeInTheDocument();
  });

  it("shows no account selected message when no account is selected", () => {
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

    render(<PaycheckPlanningPage />);

    expect(screen.getByText("No Budget Account Selected")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Please select a budget account to view paycheck planning.",
      ),
    ).toBeInTheDocument();
  });

  it("shows loading spinner when data is being fetched", () => {
    // This test verifies that the component shows a loading state
    // when the useEffect is running to fetch debt allocations
    render(<PaycheckPlanningPage />);

    // The component should show a loading spinner initially due to the useEffect
    expect(
      screen.getByText("Loading paycheck planning data..."),
    ).toBeInTheDocument();
  });
});
