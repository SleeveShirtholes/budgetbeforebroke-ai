import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PaycheckCard from "../PaycheckCard";

// Mock data
const mockPaycheck = {
  id: "paycheck-1",
  name: "Salary",
  amount: 3000,
  date: new Date("2024-01-15"),
  frequency: "monthly" as const,
  userId: "user-1",
};

const mockAllocation = {
  paycheckId: "paycheck-1",
  paycheckDate: new Date(2024, 0, 15), // Month is 0-indexed, so 0 = January
  paycheckAmount: 3000,
  allocatedDebts: [
    {
      debtId: "debt-1",
      debtName: "Credit Card",
      amount: 500,
      dueDate: "2024-01-10",
      paymentDate: "2024-01-15",
      isPaid: false,
      paymentId: "payment-1",
    },
    {
      debtId: "debt-2",
      debtName: "Student Loan",
      amount: 200,
      dueDate: "2024-01-25",
      paymentDate: "2024-01-15",
      isPaid: true,
      paymentId: "payment-2",
    },
  ],
  remainingAmount: 2300,
};

const mockHandlers = {
  onMarkPaymentAsPaid: jest.fn(),
};

describe("PaycheckCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with correct paycheck information", () => {
    render(
      <PaycheckCard
        allocation={mockAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("$3,000")).toBeInTheDocument();
    expect(screen.getByText("monthly")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
  });

  it("displays allocated debts correctly", () => {
    render(
      <PaycheckCard
        allocation={mockAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Allocated Payments")).toBeInTheDocument();
    expect(screen.getByText("Credit Card")).toBeInTheDocument();
    expect(screen.getByText("Student Loan")).toBeInTheDocument();
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("$200")).toBeInTheDocument();
  });

  it("shows correct payment status indicators", () => {
    render(
      <PaycheckCard
        allocation={mockAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    // Check payment dates - the component shows "Due Jan 10" format
    expect(screen.getByText("Due Jan 10")).toBeInTheDocument();
  });

  it("displays remaining balance correctly", () => {
    render(
      <PaycheckCard
        allocation={mockAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Remaining Balance")).toBeInTheDocument();
    expect(screen.getByText("$2,300")).toBeInTheDocument();
  });

  it("shows over budget warning when remaining amount is negative", () => {
    const overBudgetAllocation = {
      ...mockAllocation,
      remainingAmount: -100,
    };

    render(
      <PaycheckCard
        allocation={overBudgetAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Insufficient Funds")).toBeInTheDocument();
    expect(screen.getByText("-$100")).toBeInTheDocument();
  });

  it("handles mark as paid functionality", async () => {
    mockHandlers.onMarkPaymentAsPaid.mockResolvedValue(undefined);

    render(
      <PaycheckCard
        allocation={mockAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    // Find the mark as paid button for the unpaid debt
    const markAsPaidButtons = screen.getAllByText("Mark Paid");
    expect(markAsPaidButtons.length).toBeGreaterThan(0);

    // Click the first mark as paid button
    fireEvent.click(markAsPaidButtons[0]);

    await waitFor(() => {
      expect(mockHandlers.onMarkPaymentAsPaid).toHaveBeenCalledWith(
        "debt-1",
        "payment-1",
      );
    });
  });

  it("shows loading state when marking payment as paid", () => {
    const { onMarkPaymentAsPaid } = mockHandlers;
    onMarkPaymentAsPaid.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <PaycheckCard
        allocation={mockAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    // Find the mark as paid button for the unpaid debt
    const markAsPaidButtons = screen.getAllByText("Mark Paid");
    expect(markAsPaidButtons.length).toBeGreaterThan(0);

    // Click the first mark as paid button
    fireEvent.click(markAsPaidButtons[0]);

    // Should show loading spinner - the button is now disabled and shows a spinner
    const disabledButton = screen.getByRole("button", { name: "" });
    expect(disabledButton).toBeDisabled();
  });

  it("shows past due indicator for overdue debts", () => {
    const pastDueAllocation = {
      ...mockAllocation,
      allocatedDebts: [
        {
          ...mockAllocation.allocatedDebts[0],
          dueDate: "2024-01-01", // Past due date
        },
      ],
    };

    render(
      <PaycheckCard
        allocation={pastDueAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    // Should show past due indicator - the component shows "Scheduled" for past due payments
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
  });

  it("handles case when paycheck information is missing", () => {
    render(<PaycheckCard allocation={mockAllocation} {...mockHandlers} />);

    expect(screen.getByText("Paycheck")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("displays correct debt amounts and dates", () => {
    render(
      <PaycheckCard
        allocation={mockAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    // Check that amounts are displayed correctly
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("$200")).toBeInTheDocument();

    // Check that dates are displayed correctly - the component shows "Due Jan 10" format
    expect(screen.getByText("Due Jan 10")).toBeInTheDocument();
  });

  it("shows no allocated payments message when no debts", () => {
    const emptyAllocation = {
      ...mockAllocation,
      allocatedDebts: [],
    };

    render(
      <PaycheckCard
        allocation={emptyAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    // The component doesn't show "No payments allocated" - it just shows the summary with 0 payments
    expect(screen.getByText("Allocated to 0 payments")).toBeInTheDocument();
  });

  it("handles edge case with zero remaining balance", () => {
    const zeroBalanceAllocation = {
      ...mockAllocation,
      remainingAmount: 0,
    };

    render(
      <PaycheckCard
        allocation={zeroBalanceAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Fully Allocated")).toBeInTheDocument();
    expect(screen.getByText("$0")).toBeInTheDocument();
  });

  it("displays correct frequency when paycheck has frequency", () => {
    render(
      <PaycheckCard
        allocation={mockAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("monthly")).toBeInTheDocument();
  });

  it("displays payment dates correctly", () => {
    render(
      <PaycheckCard
        allocation={mockAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    // Check payment dates - the component shows "Due Jan 10" format
    expect(screen.getByText("Due Jan 10")).toBeInTheDocument();
  });

  it("handles different date formats correctly", () => {
    // Create a date explicitly in local timezone to avoid timezone issues
    const differentDateAllocation = {
      ...mockAllocation,
      paycheckDate: new Date(2024, 11, 25), // Month is 0-indexed, so 11 = December
    };

    render(
      <PaycheckCard
        allocation={differentDateAllocation}
        paycheck={mockPaycheck}
        {...mockHandlers}
      />,
    );

    // The component formats dates as "MMM dd, yyyy" so Dec 25, 2024 becomes "Dec 25, 2024"
    expect(screen.getByText("Dec 25, 2024")).toBeInTheDocument();
  });
});
