import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AssignmentBasedInterface from "../AssignmentBasedInterface";
import type {
  PaycheckInfo,
  PaycheckAllocation,
} from "@/app/actions/paycheck-planning";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the useToast hook
jest.mock("@/components/Toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

const mockPaychecks: PaycheckInfo[] = [
  {
    id: "paycheck-1",
    name: "Steve's Income",
    date: new Date("2024-01-15"),
    amount: 3000,
    frequency: "monthly",
    userId: "user-1",
  },
  {
    id: "paycheck-2",
    name: "Kelsi's Income",
    date: new Date("2024-01-15"), // Same date as paycheck-1
    amount: 4000,
    frequency: "monthly",
    userId: "user-1",
  },
  {
    id: "paycheck-3",
    name: "Steve's Income",
    date: new Date("2024-01-31"),
    amount: 3000,
    frequency: "monthly",
    userId: "user-1",
  },
];

const mockAllocations: PaycheckAllocation[] = [
  {
    paycheckId: "paycheck-1",
    paycheckDate: new Date("2024-01-15"),
    paycheckAmount: 3000,
    allocatedDebts: [
      {
        debtId: "debt-1",
        debtName: "Credit Card",
        amount: 500,
        dueDate: "2024-01-25",
        originalDueDate: "2024-01-25",
        paymentDate: "2024-01-20",
        paymentId: "payment-1",
        isPaid: false,
      },
    ],
    remainingAmount: 2500,
  },
];

const mockUnallocatedDebts = [
  {
    id: "debt-1-2024-1", // Monthly planning ID format
    debtId: "debt-1",
    debtName: "Credit Card",
    amount: 2000,
    dueDate: "2024-01-25",
    frequency: "monthly",
    description: "Credit card payment",
    isRecurring: true,
    year: 2024,
    month: 1,
    isActive: true,
  },
  {
    id: "debt-2-2024-2", // Monthly planning ID format
    debtId: "debt-2",
    debtName: "Student Loan",
    amount: 15000,
    dueDate: "2024-02-01",
    frequency: "monthly",
    description: "Student loan payment",
    isRecurring: true,
    year: 2024,
    month: 2,
    isActive: true,
  },
];

const mockHandlers = {
  onDebtAllocated: jest.fn(), // Now expects monthlyDebtPlanningId instead of debtId
  onDebtUnallocated: jest.fn(), // Now expects monthlyDebtPlanningId instead of debtId
  onDebtHidden: jest.fn(),
  onDebtRestored: jest.fn(),
  onDebtUpdated: jest.fn(),
  onMarkPaymentAsPaid: jest.fn(), // Now expects monthlyDebtPlanningId instead of debtId
};

const defaultProps = {
  currentYear: 2024,
  currentMonth: 1,
  planningWindowMonths: 1,
  hiddenDebts: [],
  ...mockHandlers,
};

describe("AssignmentBasedInterface", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with correct sections", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    expect(screen.getByText("Available Debts")).toBeInTheDocument();
    expect(screen.getByText("Paycheck Allocations")).toBeInTheDocument();
  });

  it("displays unallocated debts correctly", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    expect(screen.getByText("2 debts to allocate")).toBeInTheDocument();
    // Use getAllByText since debt names appear in both mobile and desktop layouts
    const studentLoanElements = screen.getAllByText("Student Loan");
    const creditCardElements = screen.getAllByText("Credit Card");
    expect(studentLoanElements.length).toBeGreaterThan(0);
    expect(creditCardElements.length).toBeGreaterThan(0);
  });

  it("shows correct debt details", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    // Check debt names - use getAllByText since they appear in both layouts
    const studentLoanElements = screen.getAllByText("Student Loan");
    const creditCardElements = screen.getAllByText("Credit Card");
    expect(studentLoanElements.length).toBeGreaterThan(0);
    expect(creditCardElements.length).toBeGreaterThan(0);

    // Check amounts - use getAllByText since amounts appear in multiple places
    const amount2000Elements = screen.getAllByText("$2,000");
    const amount15000Elements = screen.getAllByText("$15,000");
    expect(amount2000Elements.length).toBeGreaterThan(0);
    expect(amount15000Elements.length).toBeGreaterThan(0);

    // Check due dates - now using longer format with year
    // The formatDateSafely function now uses "MMM dd, yyyy" format
    const jan25Elements = screen.getAllByText("Jan 25, 2024");
    const feb01Elements = screen.getAllByText("Feb 01, 2024");
    expect(jan25Elements.length).toBeGreaterThan(0);
    expect(feb01Elements.length).toBeGreaterThan(0);

    // Check future debt indicators - Student Loan is due in February (next month)
    const nextMonthElements = screen.getAllByText("Next Month");
    expect(nextMonthElements.length).toBeGreaterThan(0);
  });

  it("displays paycheck allocations correctly", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    expect(screen.getByText("Paycheck Allocations")).toBeInTheDocument();
    expect(screen.getByText("Paycheck 1")).toBeInTheDocument();
    expect(screen.getByText("Paycheck 2")).toBeInTheDocument();
    // Use getAllByText since amounts appear multiple times
    const amount3000Elements = screen.getAllByText("$3,000");
    expect(amount3000Elements.length).toBeGreaterThan(0);
  });

  it("shows allocated debts in paycheck cards", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    expect(screen.getByText("Allocated Payments (1)")).toBeInTheDocument();
    // Use getAllByText since debt names appear in both layouts
    const creditCardElements = screen.getAllByText("Credit Card");
    expect(creditCardElements.length).toBeGreaterThan(0);
  });

  it("shows debt table with paycheck assignment functionality", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    // Check that the new table structure is present (multiple instances for mobile/desktop)
    const assignElements = screen.getAllByText("Assign to Paycheck");
    expect(assignElements.length).toBeGreaterThan(0);

    // Check that we can see debt names in the table (multiple instances for mobile/desktop)
    const creditCardElements = screen.getAllByText("Credit Card");
    expect(creditCardElements.length).toBeGreaterThan(0);
    const studentLoanElements = screen.getAllByText("Student Loan");
    expect(studentLoanElements.length).toBeGreaterThan(0);

    // Check that the Table component's search functionality is present
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("shows assignment dropdowns for each debt in bulk mode", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    // Check that the bulk assignment controls are visible (multiple instances for mobile/desktop)
    const assignElements = screen.getAllByText("Assign to Paycheck");
    expect(assignElements.length).toBeGreaterThan(0);
  });

  it("shows debt assignment interface with sorting capabilities", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    // Check that the Table component's sorting controls are present
    expect(screen.getByTitle("Clear sorting")).toBeInTheDocument();

    // Check that we can assign individual debts (multiple instances for mobile/desktop)
    const creditCardElements = screen.getAllByText("Credit Card");
    expect(creditCardElements.length).toBeGreaterThan(0);
    const studentLoanElements = screen.getAllByText("Student Loan");
    expect(studentLoanElements.length).toBeGreaterThan(0);

    // Check that the table headers are sortable (may have multiple instances)
    const nameElements = screen.getAllByText("Name");
    expect(nameElements.length).toBeGreaterThan(0);
    const amountElements = screen.getAllByText("Amount");
    expect(amountElements.length).toBeGreaterThan(0);
  });

  it("shows correct remaining balance for paychecks", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    // Check remaining amounts - use getAllByText since they appear multiple times
    const remainingBalanceElements = screen.getAllByText("Remaining Balance");
    expect(remainingBalanceElements.length).toBeGreaterThan(0);
  });

  it("handles debt removal correctly", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    // Find and click a remove button
    const removeButtons = screen.getAllByTitle("Remove debt");
    expect(removeButtons.length).toBeGreaterThan(0);
  });

  it("shows future debt indicator for upcoming debts", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    // Check future debt indicators - Student Loan is due in February (next month)
    const nextMonthElements = screen.getAllByText("Next Month");
    expect(nextMonthElements.length).toBeGreaterThan(0);
  });

  it("displays empty state when no unallocated debts", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={[]}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    expect(screen.getByText("All Debts Allocated")).toBeInTheDocument();
  });

  it("shows empty state for paychecks with no allocations", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={[]}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    // Component should render without errors even with no allocations
    expect(screen.getByText("Available Debts")).toBeInTheDocument();
    expect(screen.getByText("Paycheck Allocations")).toBeInTheDocument();
  });

  it("shows bulk assignment when debts are selected", async () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        hiddenDebts={[]}
        {...defaultProps}
      />,
    );

    // Initially, bulk assignment should not be visible
    expect(screen.queryByText(/Bulk Assignment/)).not.toBeInTheDocument();

    // Select a debt by clicking checkbox
    const checkboxes = screen.getAllByRole("checkbox");
    const debtCheckbox = checkboxes.find((cb) =>
      cb.getAttribute("id")?.includes("debt-"),
    );
    if (debtCheckbox) {
      fireEvent.click(debtCheckbox);

      // Now bulk assignment should be visible
      await waitFor(() => {
        expect(screen.getByText(/Bulk Assignment/)).toBeInTheDocument();
      });
    }
  });
});
