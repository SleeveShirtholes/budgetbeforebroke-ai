import { render, screen, fireEvent } from "@testing-library/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import MobileTransactionList from "../MobileTransactionList";
import { ColumnDef } from "../types";

describe("MobileTransactionList", () => {
  const mockData = [
    {
      id: "1",
      date: "2024-01-15T10:30:00Z",
      merchantName: "Starbucks",
      amount: "5.99",
      type: "expense",
      categoryName: "Food & Dining",
    },
    {
      id: "2",
      date: "2024-01-14T15:45:00Z",
      merchantName: "Shell Gas Station",
      amount: "45.50",
      type: "expense",
      categoryName: "Transportation",
    },
    {
      id: "3",
      date: "2024-01-13T09:20:00Z",
      merchantName: "Salary Deposit",
      amount: "2500.00",
      type: "income",
      categoryName: "Income",
    },
  ];

  const mockColumns: ColumnDef<(typeof mockData)[0]>[] = [
    {
      key: "date",
      header: "Date",
      accessor: (row) => row.date,
    },
    {
      key: "merchantName",
      header: "Merchant",
      accessor: (row) => row.merchantName,
    },
    {
      key: "amount",
      header: "Amount",
      accessor: (row) => row.amount,
    },
    {
      key: "categoryName",
      header: "Category",
      accessor: (row) => row.categoryName,
    },
  ];

  const mockActions = (row: (typeof mockData)[0]) => [ // eslint-disable-line @typescript-eslint/no-unused-vars
    {
      label: "Edit",
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: jest.fn(),
    },
    {
      label: "Delete",
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: jest.fn(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no data is provided", () => {
    render(<MobileTransactionList data={[]} columns={mockColumns} />);

    expect(screen.getByText("No transactions found")).toBeInTheDocument();
  });

  it("renders transactions with basic information", () => {
    render(<MobileTransactionList data={mockData} columns={mockColumns} />);

    expect(screen.getByText("Starbucks")).toBeInTheDocument();
    expect(screen.getByText("Shell Gas Station")).toBeInTheDocument();
    expect(screen.getByText("Salary Deposit")).toBeInTheDocument();

    expect(screen.getByText("Food & Dining")).toBeInTheDocument();
    expect(screen.getByText("Transportation")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
  });

  it("renders category labels", () => {
    render(<MobileTransactionList data={mockData} columns={mockColumns} />);

    const categoryLabels = screen.getAllByText("Category:");
    expect(categoryLabels).toHaveLength(3);
  });

  it("renders actions when provided", () => {
    render(
      <MobileTransactionList
        data={mockData}
        columns={mockColumns}
        actions={mockActions}
      />,
    );

    // Should have 2 action buttons per row (edit and delete)
    const actionButtons = screen.getAllByRole("button");
    expect(actionButtons).toHaveLength(6); // 2 actions × 3 rows
  });

  it("calls action onClick when action button is clicked", () => {
    const mockEditClick = jest.fn();
    const mockDeleteClick = jest.fn();

    const customActions = (row: (typeof mockData)[0]) => [ // eslint-disable-line @typescript-eslint/no-unused-vars
      {
        label: "Edit",
        icon: <PencilIcon className="w-4 h-4" />,
        onClick: mockEditClick,
      },
      {
        label: "Delete",
        icon: <TrashIcon className="w-4 h-4" />,
        onClick: mockDeleteClick,
      },
    ];

    render(
      <MobileTransactionList
        data={mockData}
        columns={mockColumns}
        actions={customActions}
      />,
    );

    const editButtons = screen.getAllByTitle("Edit");
    const deleteButtons = screen.getAllByTitle("Delete");

    fireEvent.click(editButtons[0]);
    expect(mockEditClick).toHaveBeenCalledTimes(1);

    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteClick).toHaveBeenCalledTimes(1);
  });

  it("does not render actions when not provided", () => {
    render(<MobileTransactionList data={mockData} columns={mockColumns} />);

    const actionButtons = screen.queryAllByRole("button");
    expect(actionButtons).toHaveLength(0);
  });

  it("formats amounts correctly for expenses", () => {
    render(<MobileTransactionList data={mockData} columns={mockColumns} />);

    // Check for expense formatting (negative amounts)
    expect(screen.getByText("-$5.99")).toBeInTheDocument();
    expect(screen.getByText("-$45.50")).toBeInTheDocument();
  });

  it("formats amounts correctly for income", () => {
    render(<MobileTransactionList data={mockData} columns={mockColumns} />);

    // Check for income formatting (positive amounts)
    expect(screen.getByText("+$2,500.00")).toBeInTheDocument();
  });

  it("applies correct color classes for expense vs income", () => {
    render(<MobileTransactionList data={mockData} columns={mockColumns} />);

    // Find amount elements and check their color classes
    const expenseAmount = screen.getByText("-$5.99");
    const incomeAmount = screen.getByText("+$2,500.00");

    expect(expenseAmount).toHaveClass("text-red-600");
    expect(incomeAmount).toHaveClass("text-green-600");
  });

  it("formats dates correctly", () => {
    render(<MobileTransactionList data={mockData} columns={mockColumns} />);

    // Check that dates are formatted
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 14, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 13, 2024/)).toBeInTheDocument();
  });

  it("uses fallback values when accessor is not provided", () => {
    const columnsWithoutAccessor: ColumnDef<(typeof mockData)[0]>[] = [
      {
        key: "date",
        header: "Date",
      },
      {
        key: "merchantName",
        header: "Merchant",
      },
      {
        key: "amount",
        header: "Amount",
      },
      {
        key: "categoryName",
        header: "Category",
      },
    ];

    render(
      <MobileTransactionList
        data={mockData}
        columns={columnsWithoutAccessor}
      />,
    );

    expect(screen.getByText("Starbucks")).toBeInTheDocument();
    expect(screen.getByText("Food & Dining")).toBeInTheDocument();
    expect(screen.getByText("-$5.99")).toBeInTheDocument();
  });

  it("handles rows without id by using index", () => {
    const dataWithoutId = [
      {
        date: "2024-01-15T10:30:00Z",
        merchantName: "Store 1",
        amount: "10.00",
        type: "expense",
        categoryName: "Food",
      },
      {
        date: "2024-01-14T15:45:00Z",
        merchantName: "Store 2",
        amount: "20.00",
        type: "expense",
        categoryName: "Transport",
      },
    ];

    render(
      <MobileTransactionList data={dataWithoutId} columns={mockColumns} />,
    );

    expect(screen.getByText("Store 1")).toBeInTheDocument();
    expect(screen.getByText("Store 2")).toBeInTheDocument();
  });

  it("handles accessor functions that return ReactNode", () => {
    const columnsWithReactNodeAccessor: ColumnDef<(typeof mockData)[0]>[] = [
      {
        key: "date",
        header: "Date",
        accessor: (row) => row.date,
      },
      {
        key: "merchantName",
        header: "Merchant",
        accessor: (row) => (
          <span data-testid="custom-merchant">{row.merchantName}</span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        accessor: (row) => row.amount,
      },
      {
        key: "categoryName",
        header: "Category",
        accessor: (row) => row.categoryName,
      },
    ];

    render(
      <MobileTransactionList
        data={mockData}
        columns={columnsWithReactNodeAccessor}
      />,
    );

    // The component uses getColumnValue which handles ReactNode accessors
    // Check that the merchant names are still rendered
    expect(screen.getByText("Starbucks")).toBeInTheDocument();
    expect(screen.getByText("Shell Gas Station")).toBeInTheDocument();
    expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
  });

  it("handles missing merchant name gracefully", () => {
    const dataWithMissingMerchant = [
      {
        id: "1",
        date: "2024-01-15T10:30:00Z",
        merchantName: "",
        amount: "5.99",
        type: "expense",
        categoryName: "Food & Dining",
      },
    ];

    render(
      <MobileTransactionList
        data={dataWithMissingMerchant}
        columns={mockColumns}
      />,
    );

    expect(screen.getByText("Unknown merchant")).toBeInTheDocument();
  });

  it("handles missing amount gracefully", () => {
    const dataWithMissingAmount = [
      {
        id: "1",
        date: "2024-01-15T10:30:00Z",
        merchantName: "Starbucks",
        amount: "",
        type: "expense",
        categoryName: "Food & Dining",
      },
    ];

    render(
      <MobileTransactionList
        data={dataWithMissingAmount}
        columns={mockColumns}
      />,
    );

    expect(screen.getByText("No amount")).toBeInTheDocument();
  });

  it("handles missing date gracefully", () => {
    const dataWithMissingDate = [
      {
        id: "1",
        date: "",
        merchantName: "Starbucks",
        amount: "5.99",
        type: "expense",
        categoryName: "Food & Dining",
      },
    ];

    render(
      <MobileTransactionList
        data={dataWithMissingDate}
        columns={mockColumns}
      />,
    );

    expect(screen.getByText("No date")).toBeInTheDocument();
  });

  it("renders with proper structure", () => {
    render(<MobileTransactionList data={mockData} columns={mockColumns} />);

    // Check that the component renders with proper structure
    expect(screen.getByText("Starbucks")).toBeInTheDocument();
    expect(screen.getByText("Shell Gas Station")).toBeInTheDocument();
    expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
  });

  it("handles different transaction types correctly", () => {
    const mixedData = [
      {
        id: "1",
        date: "2024-01-15T10:30:00Z",
        merchantName: "Starbucks",
        amount: "5.99",
        type: "expense",
        categoryName: "Food & Dining",
      },
      {
        id: "2",
        date: "2024-01-14T15:45:00Z",
        merchantName: "Salary",
        amount: "2500.00",
        type: "income",
        categoryName: "Income",
      },
    ];

    render(<MobileTransactionList data={mixedData} columns={mockColumns} />);

    // Check that both expense and income are formatted correctly
    expect(screen.getByText("-$5.99")).toBeInTheDocument();
    expect(screen.getByText("+$2,500.00")).toBeInTheDocument();
  });

  it("renders transaction details in correct layout", () => {
    render(<MobileTransactionList data={mockData} columns={mockColumns} />);

    // Check that the layout includes date, merchant, amount, and category
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText("Starbucks")).toBeInTheDocument();
    expect(screen.getByText("-$5.99")).toBeInTheDocument();
    expect(screen.getByText("Food & Dining")).toBeInTheDocument();
  });
});
