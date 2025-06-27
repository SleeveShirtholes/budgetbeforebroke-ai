import { fireEvent, render, screen } from "@testing-library/react";

import { RecurringDebt } from "@/types/debt";
import DebtForm from "../DebtForm";

const mockFormData: Omit<RecurringDebt, "id"> = {
  name: "Test Debt",
  balance: "1,000",
  interestRate: "5",
  dueDate: "2024-04-01",
  payments: [],
};

const mockOnChange = jest.fn();
const mockOnSubmit = jest.fn();

describe("DebtForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(
      <DebtForm
        formData={mockFormData}
        onChange={mockOnChange}
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
        formData={mockFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue("Test Debt");
    expect(screen.getByLabelText(/balance/i)).toHaveValue("1,000");
    expect(screen.getByLabelText(/interest rate/i)).toHaveValue("5");
    expect(screen.getByLabelText(/due date/i)).toHaveValue("Apr 1, 2024");
  });

  it("calls onSubmit when form is submitted", async () => {
    render(
      <DebtForm
        formData={mockFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
