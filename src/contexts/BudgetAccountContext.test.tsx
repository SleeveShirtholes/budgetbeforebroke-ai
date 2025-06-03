import { render, screen } from "@testing-library/react";
import {
  BudgetAccountProvider,
  useBudgetAccount,
} from "./BudgetAccountContext";

import { getAccounts } from "@/app/actions/account";
import { useDefaultAccount } from "@/hooks/useDefaultAccount";
import useSWR from "swr";

// Mock the dependencies
jest.mock("@/app/actions/account");
jest.mock("@/hooks/useDefaultAccount");
jest.mock("swr");

const mockGetAccounts = getAccounts as jest.MockedFunction<typeof getAccounts>;
const mockUseDefaultAccount = useDefaultAccount as jest.MockedFunction<
  typeof useDefaultAccount
>;
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

// Test component that uses the context
const TestComponent = () => {
  const { selectedAccount, accounts, isLoading } = useBudgetAccount();
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="accounts-count">{accounts.length}</div>
      {selectedAccount && (
        <div data-testid="selected-account">{selectedAccount.id}</div>
      )}
    </div>
  );
};

describe("BudgetAccountContext", () => {
  const mockAccounts = [
    {
      id: "1",
      accountNumber: "123",
      name: "Test Account",
      members: [
        {
          userId: "user1",
          role: "owner",
          user: {
            id: "user1",
            email: "test@example.com",
            name: "Test User",
            image: null,
          },
        },
      ],
      invitations: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccounts.mockResolvedValue(mockAccounts);
    mockUseDefaultAccount.mockReturnValue({
      defaultAccountId: "1",
      isLoading: false,
    });
    mockUseSWR.mockReturnValue({
      data: mockAccounts,
      isLoading: false,
      error: null,
    });
  });

  it("renders children and provides context values", () => {
    render(
      <BudgetAccountProvider>
        <TestComponent />
      </BudgetAccountProvider>,
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("accounts-count")).toHaveTextContent("1");
    expect(screen.getByTestId("selected-account")).toHaveTextContent("1");
  });

  it("handles loading state correctly", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(
      <BudgetAccountProvider>
        <TestComponent />
      </BudgetAccountProvider>,
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });

  it("maps account data correctly", () => {
    render(
      <BudgetAccountProvider>
        <TestComponent />
      </BudgetAccountProvider>,
    );

    const accountsCount = screen.getByTestId("accounts-count");
    expect(accountsCount).toHaveTextContent("1");
  });

  it("throws error when useBudgetAccount is used outside provider", () => {
    const consoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useBudgetAccount must be used within a BudgetAccountProvider");

    console.error = consoleError;
  });

  it("selects default account when available", () => {
    mockUseDefaultAccount.mockReturnValue({
      defaultAccountId: "1",
      isLoading: false,
    });

    render(
      <BudgetAccountProvider>
        <TestComponent />
      </BudgetAccountProvider>,
    );

    expect(screen.getByTestId("selected-account")).toHaveTextContent("1");
  });
});
