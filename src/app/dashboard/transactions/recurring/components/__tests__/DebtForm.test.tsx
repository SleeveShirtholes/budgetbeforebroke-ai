import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Debt } from "@/types/debt";
import DebtForm from "../DebtForm";

// Use a future date to pass validation
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

const mockDebt: Debt = {
  id: "1",
  budgetAccountId: "account-1",
  createdByUserId: "user-1",
  name: "Test Debt",
  balance: 1000,
  interestRate: 5,
  dueDate: futureDate,
  createdAt: new Date(),
  updatedAt: new Date(),
  payments: [],
};

const mockOnSubmit = jest.fn();

describe("DebtForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(
      <DebtForm
        debt={mockDebt}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/balance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it("renders initial values correctly", () => {
    render(
      <DebtForm
        debt={mockDebt}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue("Test Debt");
    expect(screen.getByLabelText(/balance/i)).toHaveValue("1,000");
    expect(screen.getByLabelText(/interest rate/i)).toHaveValue("5");
    // Get the rendered value and compare to the input's value
    const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
    const renderedValue = dueDateInput.value;
    // Parse both dates
    const renderedDate = new Date(renderedValue);
    const expectedDate = mockDebt.dueDate;
    expect(renderedDate.getFullYear()).toBe(expectedDate.getFullYear());
    expect(renderedDate.getMonth()).toBe(expectedDate.getMonth());
    // Allow a ±1 day difference
    const dayDiff = Math.abs(renderedDate.getDate() - expectedDate.getDate());
    expect(dayDiff).toBeLessThanOrEqual(1);
  });

  it("calls onSubmit when form is submitted", async () => {
    render(
      <DebtForm
        debt={mockDebt}
        onSubmit={mockOnSubmit}
      />,
    );

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Test Debt",
        balance: 1000,
        interestRate: 5,
        dueDate: futureDate.toISOString().slice(0, 10),
      });
    });
  });
});
