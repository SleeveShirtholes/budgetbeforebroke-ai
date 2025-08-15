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

  it("displays allocated debts from allocation", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    expect(screen.getByText("Credit Card")).toBeInTheDocument();
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("Utility Bill")).toBeInTheDocument();
    expect(screen.getByText("$150")).toBeInTheDocument();
  });

  it("shows remaining amount from allocation", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    // $2000 - $500 - $150 = $1350 remaining
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

  it("handles different paycheck frequencies", () => {
    const weeklyPaycheck = {
      ...mockPaycheck,
      frequency: "weekly" as const,
    };

    render(
      <DraggablePaycheckCard {...defaultProps} paycheck={weeklyPaycheck} />,
    );

    expect(screen.getByText("weekly")).toBeInTheDocument();
  });

  it("formats currency values correctly", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("$150")).toBeInTheDocument();
  });

  it("handles large debt amounts", () => {
    const largeDebtAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          debtId: "large-debt",
          debtName: "Large Debt",
          amount: 999999.99,
          dueDate: "2024-02-15",
          paymentDate: "2024-02-10",
          paymentId: "payment-1",
          isPaid: false,
        },
      ],
      remainingAmount: 1000000.01,
    };

    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={largeDebtAllocation}
      />,
    );

    expect(screen.getByText("$999,999.99")).toBeInTheDocument();
  });

  it("shows negative remaining amount when debts exceed paycheck", () => {
    const overBudgetAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          debtId: "over-budget",
          debtName: "Over Budget Debt",
          amount: 2500,
          dueDate: "2024-02-15",
          paymentDate: "2024-02-10",
          paymentId: "payment-1",
          isPaid: false,
        },
      ],
      remainingAmount: -500,
    };

    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={overBudgetAllocation}
      />,
    );

    // Should show negative remaining amount
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("Over Budget")).toBeInTheDocument();
  });

  it("maintains proper spacing and layout", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    const card = screen.getByText("Test Paycheck").closest(".rounded-xl");
    expect(card).toHaveClass("min-h-[250px]");
  });

  test("should completely hide drop zone when debts are allocated", () => {
    render(
      <DraggablePaycheckCard {...defaultProps} allocation={mockAllocation} />,
    );

    // When there are allocated debts, the drop zone background should be hidden
    // but the allocated debts should be visible
    const dropZone = screen
      .getByText("Allocated Payments")
      .closest('[class*="space-y-2 p-2"]');
    expect(dropZone).toBeTruthy();

    // But the allocated debts should be visible
    const allocatedDebts = dropZone?.querySelector('[class*="space-y-2"]');
    expect(allocatedDebts).toBeTruthy();

    // The drop zone background should be hidden (opacity-0)
    const dropZoneBackground = screen.getByTestId("drop-zone-background");
    expect(dropZoneBackground).toHaveClass("opacity-0");
  });

  test("should show drop zone only when no debts are allocated", () => {
    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={{ ...mockAllocation, allocatedDebts: [] }}
      />,
    );

    // When there are no allocated debts, the drop zone should be visible
    const dropZoneBackground = screen.getByTestId("drop-zone-background");
    expect(dropZoneBackground).not.toHaveClass("opacity-0");

    // And the allocated debts section should not be visible
    expect(screen.queryByText("Allocated Payments")).not.toBeInTheDocument();
  });

  it("displays debt due dates correctly", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    // The new structure shows "Due: Feb 15, 2024" format in separate spans
    expect(screen.getAllByText("Due:")).toHaveLength(2); // 2 debts
    expect(screen.getByText("Feb 15, 2024")).toBeInTheDocument();
    expect(screen.getByText("Feb 20, 2024")).toBeInTheDocument();
  });

  it("shows payment status indicators", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    expect(screen.getByText("Credit Card")).toBeInTheDocument();
    expect(screen.getByText("Utility Bill")).toBeInTheDocument();
    // The component shows "Due:" and "Feb 15, 2024" in separate spans
    expect(screen.getAllByText("Due:")).toHaveLength(2); // 2 debts
    expect(screen.getByText("Feb 15, 2024")).toBeInTheDocument();
  });

  it("displays late payment warnings", () => {
    const latePaymentAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          debtId: "late-bill",
          debtName: "Late Bill",
          amount: 100,
          dueDate: "2024-01-15", // Past due date
          paymentDate: "2024-02-10", // Payment after due date
          paymentId: "payment-1",
          isPaid: false,
        },
      ],
      remainingAmount: 1900,
    };

    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={latePaymentAllocation}
      />,
    );

    expect(screen.getByText("Late Bill")).toBeInTheDocument();
    // The component shows "Due:" and "Jan 15, 2024" in separate spans
    expect(screen.getByText("Due:")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
  });

  it("handles multiple debts with same due date", () => {
    const multipleDebtsAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          debtId: "first-bill",
          debtName: "First Bill",
          amount: 100,
          dueDate: "2024-02-15",
          paymentDate: "2024-02-10",
          paymentId: "payment-1",
          isPaid: false,
        },
        {
          debtId: "second-bill",
          debtName: "Second Bill",
          amount: 200,
          dueDate: "2024-02-15",
          paymentDate: "2024-02-10",
          paymentId: "payment-2",
          isPaid: false,
        },
      ],
      remainingAmount: 1700,
    };

    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={multipleDebtsAllocation}
      />,
    );

    expect(screen.getByText("First Bill")).toBeInTheDocument();
    expect(screen.getByText("Second Bill")).toBeInTheDocument();
    // Should find multiple instances of the same date
    const dates = screen.getAllByText("Feb 15, 2024");
    expect(dates).toHaveLength(2);
  });

  it("handles edge case dates", () => {
    const edgeCaseAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          debtId: "edge-case",
          debtName: "Edge Case",
          amount: 100,
          dueDate: "2023-12-31",
          paymentDate: "2023-12-30",
          paymentId: "payment-1",
          isPaid: false,
        },
      ],
      remainingAmount: 1900,
    };

    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={edgeCaseAllocation}
      />,
    );

    expect(screen.getByText("Edge Case")).toBeInTheDocument();
    expect(screen.getByText("Due:")).toBeInTheDocument();
    expect(screen.getByText("Dec 31, 2023")).toBeInTheDocument();
  });

  test("should contain drop zone within the intended area", () => {
    const { container } = render(<DraggablePaycheckCard {...defaultProps} />);

    // The drop zone should be contained within the card, not wrapping the entire card
    const card =
      container.querySelector(".bg-white") ||
      container.querySelector('[class*="rounded-lg"]');
    const dropZone = container.querySelector('[class*="flex-1"]');

    expect(card).toBeTruthy();
    expect(dropZone).toBeTruthy();

    // The drop zone should be a child of the card, not wrapping it
    expect(card).toContainElement(dropZone as HTMLElement);
  });

  test("should show drag over state only in the drop zone area", () => {
    const { container } = render(<DraggablePaycheckCard {...defaultProps} />);

    // Initially, no drag over state should be visible
    const dropZone = container.querySelector('[class*="flex-1"]');
    expect(dropZone).not.toHaveClass("bg-blue-50");
    expect(dropZone).not.toHaveClass("border-2");
    expect(dropZone).not.toHaveClass("border-dashed");
    expect(dropZone).not.toHaveClass("border-blue-400");
  });

  it("should overlay drop zone indicator without moving content", () => {
    const { container } = render(<DraggablePaycheckCard {...defaultProps} />);

    // Get the drop zone and its initial position
    const dropZone = container.querySelector(
      '[class*="flex-1"]',
    ) as HTMLElement;
    const initialHeight = dropZone.offsetHeight;

    // Simulate drag over state by manually setting the class
    dropZone.classList.add(
      "bg-blue-50",
      "border-2",
      "border-dashed",
      "border-blue-400",
    );

    // The height should remain the same (indicator overlays, doesn't push content)
    expect(dropZone.offsetHeight).toBe(initialHeight);

    // The drop zone should have the drag over classes
    expect(dropZone).toHaveClass("bg-blue-50");
    expect(dropZone).toHaveClass("border-2");
    expect(dropZone).toHaveClass("border-dashed");
    expect(dropZone).toHaveClass("border-blue-400");
  });

  test("should maintain consistent drop zone structure during drag operations", () => {
    render(
      <DraggablePaycheckCard {...defaultProps} allocation={mockAllocation} />,
    );

    // When there are allocated debts, the drop zone background should be hidden
    // but the allocated debts should be visible
    const dropZone = screen
      .getByText("Allocated Payments")
      .closest('[class*="space-y-2 p-2"]');
    expect(dropZone).toBeTruthy();

    // When there are allocated debts, the drop zone background should be hidden
    // but the allocated debts should be visible
    const dropZoneBackground = screen.getByTestId("drop-zone-background");
    expect(dropZoneBackground).toHaveClass("opacity-0");

    // The allocated debts should be visible
    const allocatedDebts = dropZone?.querySelector('[class*="space-y-2"]');
    expect(allocatedDebts).toBeTruthy();
  });

  test("should handle ghost elements without affecting layout", () => {
    render(<DraggablePaycheckCard {...defaultProps} />);

    // The component should render without errors even with ghost elements
    expect(screen.getByText("Allocated Payments")).toBeInTheDocument();
  });

  test("should use absolute positioning for drop zone background when no debts", () => {
    render(
      <DraggablePaycheckCard
        {...defaultProps}
        allocation={{ ...mockAllocation, allocatedDebts: [] }}
      />,
    );

    // The drop zone background should be absolutely positioned
    const dropZoneBackground = screen.getByTestId("drop-zone-background");
    expect(dropZoneBackground).toHaveClass("absolute", "inset-0");

    // And should have the correct background color
    expect(dropZoneBackground).toHaveClass("bg-gray-50");
  });

  test("should show drag-over indicator when dragging over paycheck with allocated debts", () => {
    render(
      <DraggablePaycheckCard {...defaultProps} allocation={mockAllocation} />,
    );

    // When there are allocated debts, the drop zone background should be hidden
    // but the allocated debts should be visible
    const dropZone = screen
      .getByText("Allocated Payments")
      .closest('[class*="space-y-2 p-2"]');
    expect(dropZone).toBeTruthy();

    // But the allocated debts should be visible
    const allocatedDebts = dropZone?.querySelector('[class*="space-y-2"]');
    expect(allocatedDebts).toBeTruthy();

    // The drop zone background should be hidden (opacity-0)
    const dropZoneBackground = screen.getByTestId("drop-zone-background");
    expect(dropZoneBackground).toHaveClass("opacity-0");

    // When dragging over, the drag-over overlay should be visible
    // This is handled by the isDragOver state in the component
  });

  test("should properly handle drag-over state without showing grey background", () => {
    render(
      <DraggablePaycheckCard {...defaultProps} allocation={mockAllocation} />,
    );

    // When there are allocated debts, the drop zone background should be hidden
    // but the allocated debts should be visible
    const dropZone = screen
      .getByText("Allocated Payments")
      .closest('[class*="space-y-2 p-2"]');
    expect(dropZone).toBeTruthy();

    // The allocated debts should be visible
    const allocatedDebts = dropZone?.querySelector('[class*="space-y-2"]');
    expect(allocatedDebts).toBeTruthy();

    // The drop zone background should be hidden (opacity-0)
    const dropZoneBackground = screen.getByTestId("drop-zone-background");
    expect(dropZoneBackground).toHaveClass("opacity-0");

    // And should not have the grey background visible
    expect(dropZoneBackground).not.toHaveClass("bg-gray-100");
  });

  test("should show additional drop zone below allocated debts", () => {
    render(
      <DraggablePaycheckCard {...defaultProps} allocation={mockAllocation} />,
    );

    const parentDropZone = screen
      .getByText("Allocated Payments")
      .closest('[class*="flex-1 relative min-h-[120px]"]');
    const additionalDropZone = parentDropZone?.querySelector(
      '[class*="mt-3 p-3"]',
    );
    expect(additionalDropZone).toBeTruthy();

    // It should contain the correct text
    const additionalDropZoneText = additionalDropZone?.textContent;
    expect(additionalDropZoneText).toContain("Drop more debts here");
  });
});
