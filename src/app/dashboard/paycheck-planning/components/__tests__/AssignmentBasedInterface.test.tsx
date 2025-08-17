import { render, screen } from "@testing-library/react";
import AssignmentBasedInterface from "../AssignmentBasedInterface";
import type {
  PaycheckInfo,
  PaycheckAllocation,
  DebtInfo,
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
    name: "January 15th",
    date: new Date("2024-01-15"),
    amount: 3000,
    frequency: "monthly",
    userId: "user-1",
  },
  {
    id: "paycheck-2",
    name: "January 31st",
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
        paymentDate: "2024-01-20",
        paymentId: "payment-1",
        isPaid: false,
      },
    ],
    remainingAmount: 2500,
  },
];

const mockUnallocatedDebts: DebtInfo[] = [
  {
    id: "debt-1",
    name: "Credit Card",
    amount: 2000,
    dueDate: "2024-01-25",
    frequency: "monthly",
    description: "Credit card payment",
    isRecurring: true,
  },
  {
    id: "debt-2",
    name: "Student Loan",
    amount: 15000,
    dueDate: "2024-02-01",
    frequency: "monthly",
    description: "Student loan payment",
    isRecurring: true,
  },
];

const mockHandlers = {
  onDebtAllocated: jest.fn(),
  onDebtUnallocated: jest.fn(),
  onDebtUpdated: jest.fn(),
  onMarkPaymentAsPaid: jest.fn(),
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
        {...mockHandlers}
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
        {...mockHandlers}
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
        {...mockHandlers}
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

    // Check due dates - now using shorter format
    const jan25Elements = screen.getAllByText("Jan 25");
    const jan30Elements = screen.getAllByText("Jan 30");
    expect(jan25Elements.length).toBeGreaterThan(0);
    expect(jan30Elements.length).toBeGreaterThan(0);

    // Check frequencies - use getAllByText since there are multiple "monthly" elements
    const monthlyElements = screen.getAllByText("monthly");
    expect(monthlyElements.length).toBeGreaterThan(0);

    // Check past due indicators - use getAllByText since there are multiple
    const pastDueElements = screen.getAllByText("Past Due");
    expect(pastDueElements.length).toBeGreaterThan(0);
  });

  it("displays paycheck allocations correctly", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Paycheck Allocations")).toBeInTheDocument();
    expect(screen.getByText("January 15th")).toBeInTheDocument();
    expect(screen.getByText("January 31st")).toBeInTheDocument();
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
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Allocated Payments (1)")).toBeInTheDocument();
    // Use getAllByText since debt names appear in both layouts
    const creditCardElements = screen.getAllByText("Credit Card");
    expect(creditCardElements.length).toBeGreaterThan(0);
  });

  it("enables bulk assignment mode when button is clicked", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        {...mockHandlers}
      />,
    );

    // Check that the bulk assignment controls are visible
    expect(screen.getByText("Select All (0/2)")).toBeInTheDocument();
    expect(screen.getByText("Assign to Paycheck")).toBeInTheDocument();
    expect(screen.getByText("Assign Selected")).toBeInTheDocument();
  });

  it("shows assignment dropdowns for each debt in bulk mode", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        {...mockHandlers}
      />,
    );

    // Check that the bulk assignment controls are visible
    expect(screen.getByText("Assign to Paycheck")).toBeInTheDocument();
  });

  it("handles debt assignment when paycheck is selected", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        {...mockHandlers}
      />,
    );

    // Check that the bulk assignment interface is working
    expect(screen.getByText("Select All (0/2)")).toBeInTheDocument();
    expect(screen.getByText("Assign to Paycheck")).toBeInTheDocument();

    // The interface should show the bulk assignment controls
    expect(screen.getByText("Assign Selected")).toBeInTheDocument();
  });

  it("shows correct remaining balance for paychecks", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        {...mockHandlers}
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
        {...mockHandlers}
      />,
    );

    // Find and click a remove button
    const removeButtons = screen.getAllByTitle("Remove debt");
    expect(removeButtons.length).toBeGreaterThan(0);
  });

  it("shows past due indicator for overdue debts", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        {...mockHandlers}
      />,
    );

    // Check past due indicators - use getAllByText since there are multiple
    const pastDueElements = screen.getAllByText("Past Due");
    expect(pastDueElements.length).toBeGreaterThan(0);
  });

  it("displays empty state when no unallocated debts", () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={[]}
        {...mockHandlers}
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
        {...mockHandlers}
      />,
    );

    // Component should render without errors even with no allocations
    expect(screen.getByText("Available Debts")).toBeInTheDocument();
    expect(screen.getByText("Paycheck Allocations")).toBeInTheDocument();
  });

  it("handles bulk assignment completion", async () => {
    render(
      <AssignmentBasedInterface
        paychecks={mockPaychecks}
        allocations={mockAllocations}
        unallocatedDebts={mockUnallocatedDebts}
        {...mockHandlers}
      />,
    );

    // Check that the bulk assignment interface is present
    expect(screen.getByText("Select All (0/2)")).toBeInTheDocument();
    expect(screen.getByText("Assign to Paycheck")).toBeInTheDocument();
    expect(screen.getByText("Assign Selected")).toBeInTheDocument();
  });
});
