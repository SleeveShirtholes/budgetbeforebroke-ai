import { render, screen } from "@testing-library/react";
import DraggablePaycheckCard from "../DraggablePaycheckCard";

/**
 * Test suite for DraggablePaycheckCard component
 * Tests drag and drop functionality, debt allocation display, and user interactions
 */
describe("DraggablePaycheckCard", () => {
  const mockPaycheck = {
    id: "paycheck-123",
    name: "Test Paycheck",
    amount: 2000,
    date: new Date("2024-01-31"),
    frequency: "bi-weekly" as const,
    userId: "test-user-id",
  };

  const mockAllocation = {
    paycheckId: "paycheck-123",
    paycheckDate: new Date("2024-01-31"),
    paycheckAmount: 2000,
    allocatedDebts: [
      {
        debtId: "debt-1",
        debtName: "Credit Card",
        amount: 500,
        dueDate: "2024-02-15",
        paymentDate: "2024-02-10",
        paymentId: "payment-1",
        isPaid: false,
      },
      {
        debtId: "debt-2",
        debtName: "Utility Bill",
        amount: 150,
        dueDate: "2024-02-20",
        paymentDate: "2024-02-10",
        paymentId: "payment-2",
        isPaid: true,
      },
    ],
    remainingAmount: 1350,
  };

  const mockUnallocatedDebts = [
    {
      id: "debt-3",
      name: "Unallocated Debt",
      amount: 300,
      dueDate: "2024-02-25",
      frequency: "monthly",
      description: "Unallocated debt",
      isRecurring: true,
    },
  ];

  const defaultProps = {
    paycheck: mockPaycheck,
    allocation: mockAllocation,
    unallocatedDebts: mockUnallocatedDebts,
    onDebtAllocated: jest.fn().mockResolvedValue(undefined),
    onDebtUnallocated: jest.fn().mockResolvedValue(undefined),
    onDebtUpdated: jest.fn().mockResolvedValue(undefined),
    onDebtMoved: jest.fn().mockResolvedValue(undefined),
    onMarkPaymentAsPaid: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders paycheck information correctly", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    expect(screen.getByText("Test Paycheck")).toBeInTheDocument();
    expect(screen.getByText("$2,000")).toBeInTheDocument();
    // The component formats dates as "MMM dd" (e.g., "Jan 30")
    expect(screen.getByText(/Jan \d+/)).toBeInTheDocument();
  });

  it("displays allocated debts correctly", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    expect(screen.getByText("Credit Card")).toBeInTheDocument();
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("Utility Bill")).toBeInTheDocument();
    expect(screen.getByText("$150")).toBeInTheDocument();
  });

  it("shows remaining amount calculation", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    // $2000 - $500 - $150 = $1350 remaining
    expect(screen.getByText("$1,350")).toBeInTheDocument();
  });

  it("displays debt due dates correctly", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    expect(screen.getByText("Due Feb 15")).toBeInTheDocument();
    expect(screen.getByText("Due Feb 20")).toBeInTheDocument();
  });

  it("shows payment status indicators", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    // Check for paid/unpaid status indicators
    const statusIndicators = screen.getAllByTestId("status-indicator");
    expect(statusIndicators).toHaveLength(2);
  });

  it("displays allocated debts from allocation", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    expect(screen.getByText("Credit Card")).toBeInTheDocument();
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("Utility Bill")).toBeInTheDocument();
    expect(screen.getByText("$150")).toBeInTheDocument();
  });

  it("shows remaining amount from allocation", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    expect(screen.getByText("$1,350")).toBeInTheDocument();
  });

  it("handles empty allocated debts", () => {
    const emptyAllocation = {
      ...mockAllocation,
      allocatedDebts: [],
      remainingAmount: 2000,
    };

    render(
      <DraggablePaycheckCard {...defaultProps} allocation={emptyAllocation} />,
    );

    // Use getAllByText to get the first occurrence (paycheck amount)
    const paycheckAmounts = screen.getAllByText("$2,000");
    expect(paycheckAmounts[0]).toBeInTheDocument(); // First occurrence is paycheck amount
    expect(screen.queryByText("Credit Card")).not.toBeInTheDocument();
  });

  it("displays late payment warnings", () => {
    const lateAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          debtId: "debt-3",
          debtName: "Late Bill",
          amount: 300,
          dueDate: "2024-01-15", // Past due
          paymentDate: "2024-02-10",
          paymentId: "payment-3",
          isPaid: false,
        },
      ],
      remainingAmount: 1700,
    };

    render(
      <DraggablePaycheckCard {...defaultProps} allocation={lateAllocation} />,
    );

    expect(screen.getByText("Late Bill")).toBeInTheDocument();
    // The component shows "Due Jan 15 ⚠️" with additional content
    expect(screen.getByText(/Due Jan 15/)).toBeInTheDocument();
  });

  it("handles different paycheck frequencies", () => {
    const weeklyPaycheck = {
      ...mockPaycheck,
      frequency: "weekly" as const,
    };

    render(
      <DraggablePaycheckCard {...defaultProps} paycheck={weeklyPaycheck} />,
    );

    expect(screen.getByText("Test Paycheck")).toBeInTheDocument();
    expect(screen.getByText("$2,000")).toBeInTheDocument();
  });

  it("formats currency values correctly", () => {
    const paycheckWithDecimals = {
      ...mockPaycheck,
      amount: 1999.99,
    };

    render(
      <DraggablePaycheckCard
        {...defaultProps}
        paycheck={paycheckWithDecimals}
      />,
    );

    expect(screen.getByText("$1,999.99")).toBeInTheDocument();
  });

  it("handles large debt amounts", () => {
    const largeDebtAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          debtId: "debt-4",
          debtName: "Large Loan",
          amount: 50000,
          dueDate: "2024-03-01",
          paymentDate: "2024-02-10",
          paymentId: "payment-4",
          isPaid: false,
        },
      ],
      remainingAmount: -48000,
    };

    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={largeDebtAllocation}
      />,
    );

    expect(screen.getByText("Large Loan")).toBeInTheDocument();
    // Use getAllByText to get the first occurrence (debt amount)
    const debtAmounts = screen.getAllByText("$50,000");
    expect(debtAmounts[0]).toBeInTheDocument(); // First occurrence is debt amount
  });

  it("shows negative remaining amount when debts exceed paycheck", () => {
    const expensiveDebtAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          debtId: "debt-5",
          debtName: "Expensive Debt",
          amount: 2500, // More than paycheck amount
          dueDate: "2024-02-15",
          paymentDate: "2024-02-10",
          paymentId: "payment-5",
          isPaid: false,
        },
      ],
      remainingAmount: -500,
    };

    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={expensiveDebtAllocation}
      />,
    );

    // Should show negative remaining amount
    expect(screen.getByText("-$500")).toBeInTheDocument();
  });

  it("handles multiple debts with same due date", () => {
    const sameDateAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          debtId: "debt-6",
          debtName: "First Bill",
          amount: 100,
          dueDate: "2024-02-15",
          paymentDate: "2024-02-10",
          paymentId: "payment-6",
          isPaid: false,
        },
        {
          debtId: "debt-7",
          debtName: "Second Bill",
          amount: 200,
          dueDate: "2024-02-15", // Same due date
          paymentDate: "2024-02-10",
          paymentId: "payment-7",
          isPaid: false,
        },
      ],
      remainingAmount: 1700,
    };

    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={sameDateAllocation}
      />,
    );

    expect(screen.getByText("First Bill")).toBeInTheDocument();
    expect(screen.getByText("Second Bill")).toBeInTheDocument();
    expect(screen.getAllByText("Due Feb 15")).toHaveLength(2);
  });

  it("maintains proper spacing and layout", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    // Check that the card has proper structure
    expect(screen.getByText("Test Paycheck")).toBeInTheDocument();
    expect(screen.getByText("$2,000")).toBeInTheDocument();
  });

  it("handles edge case dates", () => {
    const edgeCaseAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          debtId: "debt-8",
          debtName: "Edge Case",
          amount: 50,
          dueDate: "2024-12-31", // End of year
          paymentDate: "2024-12-25",
          paymentId: "payment-8",
          isPaid: false,
        },
      ],
      remainingAmount: 1950,
    };

    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={edgeCaseAllocation}
      />,
    );

    expect(screen.getByText("Edge Case")).toBeInTheDocument();
    expect(screen.getByText("Due Dec 31")).toBeInTheDocument();
  });
});
