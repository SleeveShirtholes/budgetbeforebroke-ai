import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
  paymentAmount: 1000,
  interestRate: 5,
  dueDate: futureDate,
  hasBalance: false,
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
    render(<DebtForm debt={mockDebt} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payment amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/this debt has a running balance/i),
    ).toBeInTheDocument();
  });

  it("renders initial values correctly", () => {
    render(<DebtForm debt={mockDebt} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/name/i)).toHaveValue("Test Debt");
    expect(screen.getByLabelText(/payment amount/i)).toHaveValue("1,000");
    expect(screen.getByLabelText(/interest rate/i)).toHaveValue("5");
    expect(
      screen.getByLabelText(/this debt has a running balance/i),
    ).not.toBeChecked();

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
    const user = userEvent.setup();
    render(<DebtForm debt={mockDebt} onSubmit={mockOnSubmit} />);

    // Fill out required fields to pass validation
    const nameInput = screen.getByLabelText(/name/i);
    const paymentAmountInput = screen.getByLabelText(/payment amount/i);
    const interestRateInput = screen.getByLabelText(/interest rate/i);
    const dueDateInput = screen.getByLabelText(/due date/i);

    // Clear and fill the fields
    await user.clear(nameInput);
    await user.type(nameInput, "Test Debt");

    await user.clear(paymentAmountInput);
    await user.type(paymentAmountInput, "1000");

    await user.clear(interestRateInput);
    await user.type(interestRateInput, "5");

    // For custom date picker, just set the value directly
    fireEvent.change(dueDateInput, {
      target: { value: futureDate.toISOString().slice(0, 10) },
    });

    // Submit the form
    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Test Debt",
        paymentAmount: 1000,
        interestRate: 5,
        dueDate: futureDate.toISOString().slice(0, 10),
        hasBalance: false,
      });
    });
  });
});
