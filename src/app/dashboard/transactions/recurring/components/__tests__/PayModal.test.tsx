import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import PayModal from "../PayModal";

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();
const mockOnAmountChange = jest.fn();
const mockOnDateChange = jest.fn();
const mockOnNoteChange = jest.fn();

describe("PayModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with initial values", () => {
    render(
      <PayModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        amount="100"
        date="2024-04-01"
        note="Test payment"
        onAmountChange={mockOnAmountChange}
        onDateChange={mockOnDateChange}
        onNoteChange={mockOnNoteChange}
      />,
    );

    expect(screen.getByText("Pay Recurring")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Pay")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    render(
      <PayModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        amount="100"
        date="2024-04-01"
        note="Test payment"
        onAmountChange={mockOnAmountChange}
        onDateChange={mockOnDateChange}
        onNoteChange={mockOnNoteChange}
      />,
    );

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("renders PaymentForm with correct props", () => {
    render(
      <PayModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        amount="100"
        date="2024-04-01"
        note="Test payment"
        onAmountChange={mockOnAmountChange}
        onDateChange={mockOnDateChange}
        onNoteChange={mockOnNoteChange}
      />,
    );

    // Check if form fields are rendered
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
  });

  it("passes correct initial values to PaymentForm", () => {
    render(
      <PayModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        amount="100"
        date="2024-04-01"
        note="Test payment"
        onAmountChange={mockOnAmountChange}
        onDateChange={mockOnDateChange}
        onNoteChange={mockOnNoteChange}
      />,
    );

    const amountInput = screen.getByLabelText(/amount/i);
    const dateInput = screen.getByLabelText(/date/i);
    const noteInput = screen.getByLabelText(/note/i);

    expect(amountInput).toHaveValue("100");
    expect(dateInput).toHaveValue("Mar 31, 2024");
    expect(noteInput).toHaveValue("Test payment");
  });

  it("calls onSubmit when Pay button is clicked", async () => {
    render(
      <PayModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        amount="100"
        date="2024-04-01"
        note="Test payment"
        onAmountChange={mockOnAmountChange}
        onDateChange={mockOnDateChange}
        onNoteChange={mockOnNoteChange}
      />,
    );

    const payButton = screen.getByText("Pay");
    await userEvent.click(payButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
