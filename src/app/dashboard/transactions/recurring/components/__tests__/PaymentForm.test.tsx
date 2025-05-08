import { fireEvent, render, screen } from "@testing-library/react";

import PaymentForm from "../PaymentForm";

const mockAmount = "100.00";
const mockDate = "2024-03-20T00:00:00.000Z";
const mockNote = "Test payment";

const mockOnAmountChange = jest.fn();
const mockOnDateChange = jest.fn();
const mockOnNoteChange = jest.fn();
const mockOnSubmit = jest.fn();

describe("PaymentForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(
      <PaymentForm
        amount={mockAmount}
        date={mockDate}
        note={mockNote}
        onAmountChange={mockOnAmountChange}
        onDateChange={mockOnDateChange}
        onNoteChange={mockOnNoteChange}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
  });

  it("submits the form with current values", async () => {
    render(
      <PaymentForm
        amount={mockAmount}
        date={mockDate}
        note={mockNote}
        onAmountChange={mockOnAmountChange}
        onDateChange={mockOnDateChange}
        onNoteChange={mockOnNoteChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it("shows required field indicators", () => {
    render(
      <PaymentForm
        amount={mockAmount}
        date={mockDate}
        note={mockNote}
        onAmountChange={mockOnAmountChange}
        onDateChange={mockOnDateChange}
        onNoteChange={mockOnNoteChange}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText(/amount/i).parentElement).toHaveTextContent("*");
    expect(screen.getByText(/date/i).parentElement).toHaveTextContent("*");
    expect(screen.getByText(/note/i).parentElement).not.toHaveTextContent("*");
  });

  it("shows placeholder text", () => {
    render(
      <PaymentForm
        amount={mockAmount}
        date={mockDate}
        note={mockNote}
        onAmountChange={mockOnAmountChange}
        onDateChange={mockOnDateChange}
        onNoteChange={mockOnNoteChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const amountInput = screen.getByLabelText(/amount/i);
    const dateInput = screen.getByLabelText(/date/i);
    const noteInput = screen.getByLabelText(/note/i);

    expect(amountInput).toHaveAttribute("placeholder", "0.00");
    expect(dateInput).toHaveAttribute("placeholder", "Select or enter date");
    expect(noteInput).toHaveAttribute("placeholder", "e.g., Monthly payment");
  });
});
