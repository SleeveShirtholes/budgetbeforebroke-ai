import { Transaction, TransactionCategory } from "@/types/transaction";
import { render, screen, within } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import TransactionsPage from "../page";

// Mock the mock transactions data
jest.mock("@/data/mockTransactions", () => ({
  mockTransactions: [
    {
      id: "tr-1",
      merchant: "Test Store",
      merchantLocation: "Test City",
      amount: 1000,
      date: "2024-01-01T00:00:00.000Z",
      type: "income",
      category: "Income",
      description: "Test income",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "tr-2",
      merchant: "Test Store 2",
      merchantLocation: "Test City",
      amount: 500,
      date: "2024-01-01T00:00:00.000Z",
      type: "expense",
      category: "Food",
      description: "Test expense",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ],
}));

interface TableColumn {
  key: string;
  accessor?: (row: Record<string, unknown>) => React.ReactNode;
}

// Mock components
jest.mock("@/components/Table/Table", () => {
  return function MockTable({
    data,
    columns,
  }: {
    data: Record<string, unknown>[];
    columns: TableColumn[];
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
  }: {
    value: TransactionCategory;
    onChange: (value: TransactionCategory) => void;
  }) {
    return (
      <select
        data-testid="category-select"
        value={value}
        onChange={(e) => onChange(e.target.value as TransactionCategory)}
      >
        <option value="Food">Food</option>
        <option value="Entertainment">Entertainment</option>
      </select>
    );
  };
});

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  footerButtons: React.ReactNode;
}

jest.mock("@/components/Modal", () => {
  return function MockModal({
    children,
    isOpen,
    onClose,
    footerButtons,
  }: ModalProps) {
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
  }: {
    onSubmit: (
      data: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
    ) => void;
  }) {
    const handleSubmit = () => {
      onSubmit({
        merchant: "Test Merchant",
        merchantLocation: "Test Location",
        amount: 100,
        date: "2024-01-01T00:00:00.000Z",
        type: "expense",
        category: "Food",
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
        <button type="submit">Submit</button>
      </form>
    );
  };
});

describe("Transactions Page", () => {
  const mockDate = new Date("2024-01-01T00:00:00.000Z");

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() and new Date()
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders the main components", () => {
    render(<TransactionsPage />);
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByTestId("transactions-table")).toBeInTheDocument();
  });

  it("displays correct insights", () => {
    render(<TransactionsPage />);

    // Find the insight cards by their headers
    const incomeCard = screen.getByText("Income").closest("div")?.parentElement;
    const expensesCard = screen
      .getByText("Expenses")
      .closest("div")?.parentElement;
    const savingsCard = screen
      .getByText("Money Saved")
      .closest("div")?.parentElement;

    // Check the amounts within each card
    expect(within(incomeCard!).getByText("$1,000.00")).toBeInTheDocument();
    expect(within(expensesCard!).getByText("$500.00")).toBeInTheDocument();
    expect(within(savingsCard!).getByText("$500.00")).toBeInTheDocument();
  });

  it("opens modal and creates new transaction", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TransactionsPage />);

    // Get initial transaction count
    const initialCount = screen.getByTestId("transaction-count").textContent;

    // Open modal
    await user.click(screen.getByText("Add Transaction"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    // Submit form
    await user.click(screen.getByText("Submit"));

    // Verify new transaction is added
    const newCount = screen.getByTestId("transaction-count").textContent;
    expect(Number(newCount)).toBe(Number(initialCount) + 1);
  });

  it("allows updating transaction category", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TransactionsPage />);

    const categorySelect = screen.getAllByTestId("category-select")[0];
    await user.selectOptions(categorySelect, "Entertainment");

    expect(categorySelect).toHaveValue("Entertainment");
  });

  it("formats currency values correctly", () => {
    render(<TransactionsPage />);

    const amountElements = screen.getAllByTestId("transaction-amount");
    expect(amountElements[0]).toHaveTextContent(/[+-]\$[\d,]+\.\d{2}/);
  });
});
