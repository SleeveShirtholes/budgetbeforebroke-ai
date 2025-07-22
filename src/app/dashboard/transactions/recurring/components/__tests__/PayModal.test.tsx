import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import PayModal from "../PayModal";

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();

describe("PayModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with initial values", () => {
    render(
      <PayModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    expect(screen.getByText("Pay Recurring")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Record Payment")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    render(
      <PayModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("renders PaymentForm with correct props", () => {
    render(
      <PayModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    // Check if form fields are rendered
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
  });

  it("renders form with default values", () => {
    render(
      <PayModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    const amountInput = screen.getByLabelText(/amount/i);
    const dateInput = screen.getByLabelText(/date/i);
    const noteInput = screen.getByLabelText(/note/i);

    // Check that inputs exist and have default values
    expect(amountInput).toBeInTheDocument();
    expect(dateInput).toBeInTheDocument();
    expect(noteInput).toBeInTheDocument();

    // Amount should be empty by default
    expect(amountInput).toHaveValue("");
    // Note should be empty by default
    expect(noteInput).toHaveValue("");
  });

  it("calls onSubmit when Record Payment button is clicked with valid data", async () => {
    render(
      <PayModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    // Fill in required fields
    const amountInput = screen.getByLabelText(/amount/i);
    await userEvent.type(amountInput, "100");
    // Date is pre-filled, so we can leave it as is

    const payButton = screen.getByRole("button", { name: /record payment/i });
    await userEvent.click(payButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it("passes isLoading prop correctly", () => {
    render(
      <PayModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isLoading={true}
      />,
    );

    // Find the actual button elements
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    const payButton = screen.getByRole("button", { name: /record payment/i });

    expect(cancelButton).toBeDisabled();
    expect(payButton).toBeDisabled();
  });
});
