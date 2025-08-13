import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PaymentForm from "../PaymentForm";

const mockOnSubmit = jest.fn();

describe("PaymentForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<PaymentForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
  });

  it("submits the form with entered values", async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={mockOnSubmit} />);

    // Fill in the form fields
    const amountInput = screen.getByLabelText(/amount/i);
    const noteInput = screen.getByLabelText(/note/i);

    fireEvent.change(amountInput, { target: { value: "100.5" } });
    await user.type(noteInput, "Test payment");

    // Submit the form
    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100.5,
          note: "Test payment",
        }),
      );
      // Check that date is a valid ISO string
      const submitted = mockOnSubmit.mock.calls[0][0];
      expect(typeof submitted.date).toBe("string");
      expect(new Date(submitted.date).toString()).not.toBe("Invalid Date");
    });
  });

  it("shows required field indicators", () => {
    render(<PaymentForm onSubmit={mockOnSubmit} />);

    // Check that amount and date fields show required indicators
    const amountLabel = screen.getByText(/amount/i);
    const dateLabel = screen.getByText(/date/i);
    const noteLabel = screen.getByText(/note/i);

    expect(amountLabel.parentElement).toHaveTextContent("*");
    expect(dateLabel.parentElement).toHaveTextContent("*");
    expect(noteLabel.parentElement).not.toHaveTextContent("*");
  });

  it("shows placeholder text", () => {
    render(<PaymentForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    const dateInput = screen.getByLabelText(/date/i);
    const noteInput = screen.getByLabelText(/note/i);

    expect(amountInput).toHaveAttribute("placeholder", "0.00");
    expect(dateInput).toHaveAttribute("placeholder", "Select or enter date");
    expect(noteInput).toHaveAttribute("placeholder", "e.g., Monthly payment");
  });

  it("disables form fields when loading", () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={true} />);

    const amountInput = screen.getByLabelText(/amount/i);
    const dateInput = screen.getByLabelText(/date/i);
    const noteInput = screen.getByLabelText(/note/i);

    expect(amountInput).toBeDisabled();
    expect(dateInput).toBeDisabled();
    expect(noteInput).toBeDisabled();
  });

  it("shows validation errors for invalid amount", async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    const form = screen.getByRole("form");

    // Try to submit with invalid amount
    await user.clear(amountInput);
    await user.type(amountInput, "0");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/payment amount must be greater than 0/i),
      ).toBeInTheDocument();
    });
  });

  it("shows validation errors for empty amount", async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    const form = screen.getByRole("form");

    // Try to submit with empty amount
    await user.clear(amountInput);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  it("handles large amount validation", async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    const form = screen.getByRole("form");

    // Try to submit with a very large amount
    await user.clear(amountInput);
    await user.type(amountInput, "1000000000");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/payment amount must be less than 1 billion/i),
      ).toBeInTheDocument();
    });
  });
});
