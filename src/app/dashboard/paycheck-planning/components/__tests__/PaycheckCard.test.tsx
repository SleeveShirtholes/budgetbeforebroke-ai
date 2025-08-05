import { render, screen } from "@testing-library/react";
import PaycheckCard from "../PaycheckCard";
import type {
  PaycheckAllocation,
  PaycheckInfo,
} from "@/app/actions/paycheck-planning";

describe("PaycheckCard", () => {
  const mockPaycheck: PaycheckInfo = {
    id: "paycheck-1",
    name: "Salary",
    amount: 3000,
    date: new Date("2024-01-15"),
    frequency: "bi-weekly",
    userId: "user-1",
  };

  const mockAllocation: PaycheckAllocation = {
    paycheckId: "paycheck-1",
    paycheckDate: new Date("2024-01-15"),
    paycheckAmount: 3000,
    allocatedDebts: [
      {
        debtId: "debt-1",
        debtName: "Rent",
        amount: 1200,
        dueDate: new Date("2024-01-01"),
      },
      {
        debtId: "debt-2",
        debtName: "Car Payment",
        amount: 400,
        dueDate: new Date("2024-01-10"),
      },
    ],
    remainingAmount: 1400,
  };

  it("renders paycheck information correctly", () => {
    render(
      <PaycheckCard allocation={mockAllocation} paycheck={mockPaycheck} />,
    );

    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
    expect(screen.getByText("bi-weekly")).toBeInTheDocument();
    expect(screen.getByText("$3,000")).toBeInTheDocument();
  });

  it("renders allocated debts correctly", () => {
    render(
      <PaycheckCard allocation={mockAllocation} paycheck={mockPaycheck} />,
    );

    expect(screen.getByText("Allocated Payments")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("Due Jan 01")).toBeInTheDocument();
    expect(screen.getByText("$1,200")).toBeInTheDocument();

    expect(screen.getByText("Car Payment")).toBeInTheDocument();
    expect(screen.getByText("Due Jan 10")).toBeInTheDocument();
    expect(screen.getByText("$400")).toBeInTheDocument();
  });

  it("shows positive remaining balance correctly", () => {
    render(
      <PaycheckCard allocation={mockAllocation} paycheck={mockPaycheck} />,
    );

    expect(screen.getByText("Remaining Balance")).toBeInTheDocument();
    expect(screen.getByText("$1,400")).toBeInTheDocument();
  });

  it("shows insufficient funds correctly", () => {
    const insufficientAllocation: PaycheckAllocation = {
      ...mockAllocation,
      remainingAmount: -500,
    };

    render(
      <PaycheckCard
        allocation={insufficientAllocation}
        paycheck={mockPaycheck}
      />,
    );

    expect(screen.getByText("Insufficient Funds")).toBeInTheDocument();
    expect(screen.getByText("-$500")).toBeInTheDocument();
  });

  it("shows fully allocated state correctly", () => {
    const fullyAllocatedAllocation: PaycheckAllocation = {
      ...mockAllocation,
      remainingAmount: 0,
    };

    render(
      <PaycheckCard
        allocation={fullyAllocatedAllocation}
        paycheck={mockPaycheck}
      />,
    );

    expect(screen.getByText("Fully Allocated")).toBeInTheDocument();
    expect(screen.getByText("$0")).toBeInTheDocument();
  });

  it("renders without paycheck info", () => {
    render(<PaycheckCard allocation={mockAllocation} />);

    expect(screen.getByText("Paycheck")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("renders with no allocated debts", () => {
    const emptyAllocation: PaycheckAllocation = {
      ...mockAllocation,
      allocatedDebts: [],
      remainingAmount: 3000,
    };

    render(
      <PaycheckCard allocation={emptyAllocation} paycheck={mockPaycheck} />,
    );

    expect(screen.queryByText("Allocated Payments")).not.toBeInTheDocument();
    expect(screen.getByText("Allocated to 0 payments")).toBeInTheDocument();
    expect(screen.getByText("$0 total")).toBeInTheDocument();
  });

  it("displays summary information correctly", () => {
    render(
      <PaycheckCard allocation={mockAllocation} paycheck={mockPaycheck} />,
    );

    expect(screen.getByText("Allocated to 2 payments")).toBeInTheDocument();
    expect(screen.getByText("$1,600 total")).toBeInTheDocument();
  });

  it("applies correct styling for different states", () => {
    const { rerender } = render(
      <PaycheckCard allocation={mockAllocation} paycheck={mockPaycheck} />,
    );

    // Positive balance - should have green styling
    expect(screen.getByText("$1,400")).toHaveClass("text-green-900");

    const insufficientAllocation: PaycheckAllocation = {
      ...mockAllocation,
      remainingAmount: -500,
    };

    rerender(
      <PaycheckCard
        allocation={insufficientAllocation}
        paycheck={mockPaycheck}
      />,
    );

    // Negative balance - should have red styling
    expect(screen.getByText("-$500")).toHaveClass("text-red-900");
  });
});
