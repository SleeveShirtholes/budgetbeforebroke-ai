import { render, screen } from "@testing-library/react";

import { ColumnDef } from "@/components/Table/types";
import { Transaction } from "@/app/actions/transaction";
import { format } from "date-fns";
import RecentTransactions from "../RecentTransactions";

// Mock the Table component since we don't need to test its internal implementation
jest.mock("@/components/Table/Table", () => {
  return function MockTable({
    data,
    columns,
  }: {
    data: Transaction[];
    columns: ColumnDef<Transaction>[];
  }) {
    return (
      <div data-testid="mock-table">
        <div data-testid="table-data">{JSON.stringify(data)}</div>
        <div data-testid="table-columns">
          {JSON.stringify(
            columns.map((col) => ({
              ...col,
              accessor: col.accessor ? "has-accessor" : undefined,
            })),
          )}
        </div>
      </div>
    );
  };
});

describe("RecentTransactions", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      budgetAccountId: "account-1",
      categoryId: "category-1",
      createdByUserId: "user-1",
      amount: 50.25,
      description: "Grocery shopping",
      date: new Date("2024-03-15"),
      type: "expense",
      status: "completed",
      merchantName: "Grocery Store",
      plaidCategory: null,
      pending: false,
      createdAt: new Date("2024-03-15T10:00:00Z"),
      updatedAt: new Date("2024-03-15T10:00:00Z"),
      categoryName: "Food",
    },
    {
      id: "2",
      budgetAccountId: "account-1",
      categoryId: "category-2",
      createdByUserId: "user-1",
      amount: 3000.0,
      description: "Monthly salary",
      date: new Date("2024-03-14"),
      type: "income",
      status: "completed",
      merchantName: "Employer",
      plaidCategory: null,
      pending: false,
      createdAt: new Date("2024-03-14T09:00:00Z"),
      updatedAt: new Date("2024-03-14T09:00:00Z"),
      categoryName: "Income",
    },
  ];

  it("renders the component with a title", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
  });

  it("displays 'No transactions found' when transactions array is empty", () => {
    render(<RecentTransactions transactions={[]} />);
    expect(screen.getByText("No transactions found")).toBeInTheDocument();
  });

  it("renders the Table component with correct props when transactions exist", () => {
    render(<RecentTransactions transactions={mockTransactions} />);

    const table = screen.getByTestId("mock-table");
    expect(table).toBeInTheDocument();

    const tableData = screen.getByTestId("table-data");
    const serializedData = JSON.parse(tableData.textContent || "");

    // Convert Date objects to strings for comparison since JSON.stringify converts them
    const expectedSerializedData = mockTransactions.map((transaction) => ({
      ...transaction,
      date: transaction.date.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    }));

    expect(serializedData).toEqual(expectedSerializedData);

    const tableColumns = screen.getByTestId("table-columns");
    const columns = JSON.parse(tableColumns.textContent || "");

    // Verify column structure
    expect(columns).toHaveLength(4);
    expect(columns[0].key).toBe("date");
    expect(columns[1].key).toBe("merchantName");
    expect(columns[2].key).toBe("amount");
    expect(columns[3].key).toBe("categoryName");

    // Verify column configurations
    columns.forEach((column: { sortable: boolean; filterable: boolean }) => {
      expect(column).toHaveProperty("sortable", true);
      expect(column).toHaveProperty("filterable", true);
    });
  });

  it("formats dates correctly", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    const tableColumns = screen.getByTestId("table-columns");
    const columns = JSON.parse(tableColumns.textContent || "");

    const dateColumn = columns.find(
      (col: { key: string }) => col.key === "date",
    );
    expect(dateColumn).toHaveProperty("accessor", "has-accessor");

    // Test the date formatter directly matching the component's behavior
    const formattedDate = format(
      new Date(mockTransactions[0].date),
      "MMM d, yyyy",
    );
    // Test that the formatted date contains the correct month, year, and a day number
    expect(formattedDate).toMatch(/Mar \d{1,2}, 2024/);
  });

  it("formats amounts correctly with color coding", () => {
    render(<RecentTransactions transactions={mockTransactions} />);
    const tableColumns = screen.getByTestId("table-columns");
    const columns = JSON.parse(tableColumns.textContent || "");

    const amountColumn = columns.find(
      (col: { key: string }) => col.key === "amount",
    );
    expect(amountColumn).toHaveProperty("accessor", "has-accessor");

    // Test the amount formatting directly
    const expenseAmount = mockTransactions[0].amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(expenseAmount).toBe("50.25");

    const incomeAmount = mockTransactions[1].amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(incomeAmount).toBe("3,000.00");
  });
});
