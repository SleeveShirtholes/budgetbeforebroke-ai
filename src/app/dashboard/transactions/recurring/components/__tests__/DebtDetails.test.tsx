import { render, screen } from "@testing-library/react";

import { RecurringDebt } from "@/types/debt";
import DebtDetails from "../DebtDetails";

const mockDebt: RecurringDebt = {
  id: "1",
  name: "Test Debt",
  balance: "1000",
  interestRate: "5",
  dueDate: "2024-04-01",
  payments: [],
};

describe("DebtDetails", () => {
  it("renders debt information correctly", () => {
    render(<DebtDetails debt={mockDebt} search="" />);

    expect(screen.getByText("Test Debt")).toBeInTheDocument();
    expect(screen.getByText("$1000")).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();
    expect(
      screen.getByText(new Date("2024-04-01").toLocaleDateString()),
    ).toBeInTheDocument();
  });

  it("highlights text when search term matches", () => {
    render(<DebtDetails debt={mockDebt} search="Test" />);

    const highlightedElement = screen.getByText("Test");
    expect(highlightedElement).toHaveClass("bg-yellow-200");
  });

  it("does not highlight text when search term does not match", () => {
    render(<DebtDetails debt={mockDebt} search="Nonexistent" />);

    const element = screen.getByText("Test Debt");
    expect(element).not.toHaveClass("bg-yellow-200");
  });

  it("renders all required sections", () => {
    render(<DebtDetails debt={mockDebt} search="" />);

    expect(screen.getByText("Balance")).toBeInTheDocument();
    expect(screen.getByText("Interest Rate")).toBeInTheDocument();
    expect(screen.getByText("Due Date")).toBeInTheDocument();
  });

  it("formats currency and percentage correctly", () => {
    render(<DebtDetails debt={mockDebt} search="" />);

    expect(screen.getByText("$1000")).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();
  });
});
