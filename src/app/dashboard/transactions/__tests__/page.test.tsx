import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useSWR, { mutate } from "swr";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import {
  createTransaction,
  updateTransactionCategory,
} from "@/app/actions/transaction";
import TransactionsPage from "../page";
import { ToastProvider } from "@/components/Toast";

// Mock SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
  mutate: jest.fn(),
}));

// Mock the transaction actions
jest.mock("@/app/actions/transaction", () => ({
  getTransactions: jest.fn(),
  getTransactionCategories: jest.fn(),
  createTransaction: jest.fn(),
  updateTransactionCategory: jest.fn(),
}));

// Mock useBudgetAccount hook
jest.mock("@/stores/budgetAccountStore", () => ({
  useBudgetAccount: jest.fn(),
}));

// Mock components
jest.mock("@/components/Table/Table", () => {
  return function MockTable({
    data,
    columns,
  }: {
    data: Record<string, unknown>[];
    columns: Array<{
      key: string;
      accessor?: (row: Record<string, unknown>) => unknown;
    }>;
  }) {
    return (
      <div data-testid="transactions-table">
        <div>Transactions Table</div>
        <div data-testid="transaction-count">{data.length}</div>
        {data.map((row, index) => (
          <div key={index} data-testid="transaction-row">
            {columns.map((col) => (
              <div key={col.key} data-testid={`transaction-${col.key}`}>
                {col.accessor ? col.accessor(row) : String(row[col.key])}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock("@/components/Forms/CustomSelect", () => {
  return function MockCustomSelect({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }) {
    return (
      <select
        data-testid="category-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };
});

jest.mock("@/components/Modal", () => {
  return function MockModal({
    children,
    isOpen,
    onClose,
    footerButtons,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    footerButtons: React.ReactNode;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        {children}
        {footerButtons}
        <button onClick={onClose} data-testid="close-modal">
          Close
        </button>
      </div>
    );
  };
});

jest.mock("@/components/TransactionForm", () => {
  return function MockTransactionForm({
    onSubmit,
    isSubmitting,
  }: {
    onSubmit: (data: {
      date: string;
      merchantName: string;
      amount: number;
      type: "income" | "expense";
      categoryId: string;
      description: string;
    }) => void;
    isSubmitting?: boolean;
  }) {
    const handleSubmit = () => {
      onSubmit({
        date: "2024-01-01T00:00:00.000Z",
        merchantName: "Test Merchant",
        amount: 100,
        type: "expense" as const,
        categoryId: "category-1",
        description: "Test transaction",
      });
    };

    return (
      <form
        data-testid="transaction-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Submit"}
        </button>
      </form>
    );
  };
});

jest.mock("@/components/Spinner", () => {
  return function MockSpinner() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

describe("Transactions Page", () => {
  const mockTransactions = [
    {
      id: "1",
      budgetAccountId: "account-1",
      categoryId: "category-1",
      createdByUserId: "user-1",
      amount: 1000,
      description: "Test income",
      date: new Date("2024-01-01T00:00:00.000Z"),
      type: "income" as const,
      status: "completed",
      merchantName: "Test Store",
      plaidCategory: null,
      pending: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      categoryName: "Income",
    },
    {
      id: "2",
      budgetAccountId: "account-1",
      categoryId: "category-2",
      createdByUserId: "user-1",
      amount: 500,
      description: "Test expense",
      date: new Date("2024-01-01T00:00:00.000Z"),
      type: "expense" as const,
      status: "completed",
      merchantName: "Test Store 2",
      plaidCategory: null,
      pending: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      categoryName: "Food",
    },
  ];

  const mockCategories = [
    {
      id: "category-1",
      name: "Income",
      description: "Income category",
      color: "#22c55e",
      icon: "money",
    },
    {
      id: "category-2",
      name: "Food",
      description: "Food category",
      color: "#ef4444",
      icon: "food",
    },
  ];

  const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
  const mockMutate = mutate as jest.MockedFunction<typeof mutate>;
  const mockUseBudgetAccount = useBudgetAccount as jest.MockedFunction<
    typeof useBudgetAccount
  >;
  const mockCreateTransaction = createTransaction as jest.MockedFunction<
    typeof createTransaction
  >;
  const mockUpdateTransactionCategory =
    updateTransactionCategory as jest.MockedFunction<
      typeof updateTransactionCategory
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date to 2024-01-15 so mock transactions are within the last 30 days
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T00:00:00.000Z"));

    // Mock useBudgetAccount to return a selected account
    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: {
        id: "account-1",
        nickname: "Test Account",
      },
    });

    // Mock SWR to return successful data
    mockUseSWR.mockImplementation((key: string | string[]) => {
      if (Array.isArray(key) && key[0] === "transactions") {
        return {
          data: mockTransactions,
          error: null,
          isLoading: false,
        };
      }
      if (Array.isArray(key) && key[0] === "transaction-categories") {
        return {
          data: mockCategories,
          error: null,
          isLoading: false,
        };
      }
      return {
        data: undefined,
        error: null,
        isLoading: false,
      };
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderWithToast = (component: React.ReactElement) => {
    return render(<ToastProvider>{component}</ToastProvider>);
  };

  it("renders the main components", () => {
    renderWithToast(<TransactionsPage />);
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByTestId("transactions-table")).toBeInTheDocument();
  });

  it("displays correct insights", () => {
    renderWithToast(<TransactionsPage />);

    // Find the insight cards by their headers (filter for <p> with correct class)
    const incomeCardLabel = screen
      .getAllByText("Income")
      .find((el) => el.tagName === "P" && el.className.includes("font-medium"));
    const expensesCardLabel = screen
      .getAllByText("Expenses")
      .find((el) => el.tagName === "P" && el.className.includes("font-medium"));
    const savingsCardLabel = screen
      .getAllByText("Net Savings")
      .find((el) => el.tagName === "P" && el.className.includes("font-medium"));

    // Get the parent card for each label
    const incomeCard = incomeCardLabel?.closest(".bg-white");
    const expensesCard = expensesCardLabel?.closest(".bg-white");
    const savingsCard = savingsCardLabel?.closest(".bg-white");

    // Check the amounts within each card
    expect(incomeCard).toHaveTextContent("$1,000");
    expect(expensesCard).toHaveTextContent("$500");
    expect(savingsCard).toHaveTextContent("$500");
  });

  it("shows loading state when data is loading", () => {
    mockUseSWR.mockImplementation(() => ({
      data: undefined,
      error: null,
      isLoading: true,
    }));

    renderWithToast(<TransactionsPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows error state when data fails to load", () => {
    mockUseSWR.mockImplementation(() => ({
      data: undefined,
      error: new Error("Failed to load"),
      isLoading: false,
    }));

    renderWithToast(<TransactionsPage />);
    expect(
      screen.getByText("Failed to load transactions. Please try again."),
    ).toBeInTheDocument();
  });

  it("opens modal and creates new transaction", async () => {
    const user = userEvent.setup({ delay: null });
    mockCreateTransaction.mockResolvedValue({ id: "new-transaction" });

    renderWithToast(<TransactionsPage />);

    // Open modal
    await user.click(screen.getByText("Add Transaction"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    // Submit form
    await user.click(screen.getByText("Submit"));

    // Verify transaction creation was called
    await waitFor(() => {
      expect(mockCreateTransaction).toHaveBeenCalledWith({
        date: "2024-01-01T00:00:00.000Z",
        merchantName: "Test Merchant",
        amount: 100,
        type: "expense",
        categoryId: "category-1",
        description: "Test transaction",
      });
    });

    // Verify SWR mutate was called with the correct keys
    expect(mockMutate).toHaveBeenCalledWith(["transactions", "account-1"]);
    expect(mockMutate).toHaveBeenCalledWith([
      "transaction-categories",
      "account-1",
    ]);
  });

  it("allows updating transaction category", async () => {
    const user = userEvent.setup({ delay: null });
    mockUpdateTransactionCategory.mockResolvedValue({ id: "1" });

    renderWithToast(<TransactionsPage />);

    const categorySelect = screen.getAllByTestId("category-select")[0];
    await user.selectOptions(categorySelect, "category-2");

    // Verify update was called
    await waitFor(() => {
      expect(mockUpdateTransactionCategory).toHaveBeenCalledWith(
        "1",
        "category-2",
      );
    });

    // Verify SWR mutate was called with the correct keys
    expect(mockMutate).toHaveBeenCalledWith(["transactions", "account-1"]);
    expect(mockMutate).toHaveBeenCalledWith([
      "transaction-categories",
      "account-1",
    ]);
  });

  it("formats currency values correctly", () => {
    renderWithToast(<TransactionsPage />);

    const amountElements = screen.getAllByTestId("transaction-amount");
    expect(amountElements[0]).toHaveTextContent(/[+-]\$[\d,]+\.\d{2}/);
  });
});
