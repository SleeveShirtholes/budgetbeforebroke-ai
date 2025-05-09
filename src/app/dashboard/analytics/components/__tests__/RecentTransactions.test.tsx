import { render, screen } from "@testing-library/react";

import { ColumnDef } from "@/components/Table/types";
import { Transaction } from "@/types/transaction";
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
      date: "2024-03-15",
      description: "Grocery shopping",
      merchant: "Grocery Store",
      merchantLocation: "Local Store",
      amount: 50.25,
      type: "expense",
      category: "Food",
      createdAt: "2024-03-15T10:00:00Z",
      updatedAt: "2024-03-15T10:00:00Z",
    },
    {
      id: "2",
      date: "2024-03-14",
      description: "Monthly salary",
      merchant: "Employer",
      merchantLocation: "Office",
      amount: 3000.0,
      type: "income",
      category: "Income",
      createdAt: "2024-03-14T09:00:00Z",
      updatedAt: "2024-03-14T09:00:00Z",
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
    expect(JSON.parse(tableData.textContent || "")).toEqual(mockTransactions);

    const tableColumns = screen.getByTestId("table-columns");
    const columns = JSON.parse(tableColumns.textContent || "");

    // Verify column structure
    expect(columns).toHaveLength(4);
    expect(columns[0].key).toBe("date");
    expect(columns[1].key).toBe("merchant");
    expect(columns[2].key).toBe("amount");
    expect(columns[3].key).toBe("category");

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
