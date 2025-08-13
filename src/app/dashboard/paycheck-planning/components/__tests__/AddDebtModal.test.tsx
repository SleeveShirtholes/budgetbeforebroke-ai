import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddDebtModal from "../AddDebtModal";

// Mock the createDebt action
jest.mock("@/app/actions/debt", () => ({
  createDebt: jest.fn(),
}));

import { createDebt } from "@/app/actions/debt";

/**
 * Test suite for AddDebtModal component
 * Tests form functionality, validation, and debt creation
 */
describe("AddDebtModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onDebtAdded: jest.fn(),
    budgetAccountId: "test-account-id",
  };

  const mockCreateDebt = createDebt as jest.MockedFunction<typeof createDebt>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateDebt.mockResolvedValue({
      id: "123e4567-e89b-12d3-a456-426614174000",
    });
  });

  it("renders the modal when open", () => {
    render(<AddDebtModal {...defaultProps} />);

    expect(screen.getByText("Add New Debt/Bill")).toBeInTheDocument();
    expect(screen.getByLabelText("Name *")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount *")).toBeInTheDocument();
    expect(screen.getByLabelText("Due Date *")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<AddDebtModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Add New Debt/Bill")).not.toBeInTheDocument();
  });

  it("shows frequency field when recurring is checked", async () => {
    const user = userEvent.setup();
    render(<AddDebtModal {...defaultProps} />);

    // Frequency should be visible by default since isRecurring is true
    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();

    // Uncheck recurring
    const recurringCheckbox = screen.getByLabelText("Recurring payment");
    await user.click(recurringCheckbox);

    // Frequency should be hidden
    expect(screen.queryByLabelText("Frequency")).not.toBeInTheDocument();
  });

  it("submits form with correct data for recurring debt", async () => {
    const user = userEvent.setup();
    render(<AddDebtModal {...defaultProps} />);

    // Fill out the form
    await user.type(screen.getByLabelText("Name *"), "Test Debt");
    await user.type(screen.getByLabelText("Amount *"), "500");
    await user.type(screen.getByLabelText("Due Date *"), "2024-02-15");
    await user.type(
      screen.getByLabelText("Description (Optional)"),
      "Test description",
    );

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Add Debt" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateDebt).toHaveBeenCalledWith({
        name: "Test Debt (monthly)",
        paymentAmount: 500,
        interestRate: 0,
        dueDate: "2024-02-15",
        hasBalance: false,
      });
    });

    expect(defaultProps.onDebtAdded).toHaveBeenCalled();
  });

  it("submits form with correct data for one-time debt", async () => {
    const user = userEvent.setup();
    render(<AddDebtModal {...defaultProps} />);

    // Uncheck recurring first
    const recurringCheckbox = screen.getByLabelText("Recurring payment");
    await user.click(recurringCheckbox);

    // Fill out the form
    await user.type(screen.getByLabelText("Name *"), "One Time Bill");
    await user.type(screen.getByLabelText("Amount *"), "250");
    await user.type(screen.getByLabelText("Due Date *"), "2024-03-01");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Add Debt" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateDebt).toHaveBeenCalledWith({
        name: "One Time Bill",
        paymentAmount: 250,
        interestRate: 0,
        dueDate: "2024-03-01",
        hasBalance: false,
      });
    });

    expect(defaultProps.onDebtAdded).toHaveBeenCalled();
  });

  it("handles form submission errors", async () => {
    const user = userEvent.setup();
    const errorMessage = "Failed to create debt";
    mockCreateDebt.mockRejectedValue(new Error(errorMessage));

    render(<AddDebtModal {...defaultProps} />);

    // Fill out and submit the form
    await user.type(screen.getByLabelText("Name *"), "Test Debt");
    await user.type(screen.getByLabelText("Amount *"), "500");
    await user.type(screen.getByLabelText("Due Date *"), "2024-02-15");

    const submitButton = screen.getByRole("button", { name: "Add Debt" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("resets form after successful submission", async () => {
    const user = userEvent.setup();
    render(<AddDebtModal {...defaultProps} />);

    // Fill out the form
    await user.type(screen.getByLabelText("Name *"), "Test Debt");
    await user.type(screen.getByLabelText("Amount *"), "500");
    await user.type(screen.getByLabelText("Due Date *"), "2024-02-15");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Add Debt" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Name *")).toHaveValue("");
      expect(screen.getByLabelText("Amount *")).toHaveValue("");
      expect(screen.getByLabelText("Due Date *")).toHaveValue("");
    });
  });

  it("resets form when modal is closed", async () => {
    const user = userEvent.setup();
    render(<AddDebtModal {...defaultProps} />);

    // Fill out the form
    await user.type(screen.getByLabelText("Name *"), "Test Debt");
    await user.type(screen.getByLabelText("Amount *"), "500");
    await user.type(screen.getByLabelText("Due Date *"), "2024-02-15");

    // Close the modal
    const closeButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(closeButton);

    // Reopen and check if form is reset
    render(<AddDebtModal {...defaultProps} />);

    expect(screen.getByLabelText("Name *")).toHaveValue("");
    expect(screen.getByLabelText("Amount *")).toHaveValue("");
    expect(screen.getByLabelText("Due Date *")).toHaveValue("");
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    // Make the promise hang to test loading state
    let resolvePromise: (value: {
      id: "123e4567-e89b-12d3-a456-426614174000";
    }) => void;
    const pendingPromise = new Promise<{
      id: "123e4567-e89b-12d3-a456-426614174000";
    }>((resolve) => {
      resolvePromise = resolve;
    });
    mockCreateDebt.mockReturnValue(pendingPromise);

    render(<AddDebtModal {...defaultProps} />);

    // Fill out and submit the form
    await user.type(screen.getByLabelText("Name *"), "Test Debt");
    await user.type(screen.getByLabelText("Amount *"), "500");
    await user.type(screen.getByLabelText("Due Date *"), "2024-02-15");

    const submitButton = screen.getByRole("button", { name: "Add Debt" });
    await user.click(submitButton);

    // Check loading state - the Button component shows loading state
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolvePromise!({ id: "123e4567-e89b-12d3-a456-426614174000" });
  });

  it("handles amount parsing correctly", async () => {
    const user = userEvent.setup();
    render(<AddDebtModal {...defaultProps} />);

    // Fill out the form with decimal amount
    await user.type(screen.getByLabelText("Name *"), "Test Debt");
    await user.type(screen.getByLabelText("Amount *"), "500.50");
    await user.type(screen.getByLabelText("Due Date *"), "2024-02-15");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Add Debt" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateDebt).toHaveBeenCalledWith({
        name: "Test Debt (monthly)",
        paymentAmount: 500.5,
        interestRate: 0,
        dueDate: "2024-02-15",
        hasBalance: false,
      });
    });
  });

  it("handles invalid amount gracefully", async () => {
    const user = userEvent.setup();
    render(<AddDebtModal {...defaultProps} />);

    // Fill out the form with invalid amount
    await user.type(screen.getByLabelText("Name *"), "Test Debt");
    await user.type(screen.getByLabelText("Amount *"), "invalid");
    await user.type(screen.getByLabelText("Due Date *"), "2024-02-15");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Add Debt" });
    await user.click(submitButton);

    // Form validation should prevent submission with invalid amount
    expect(mockCreateDebt).not.toHaveBeenCalled();

    // Error message should be displayed
    expect(
      screen.getByText("Please enter a valid amount (e.g., 100 or 100.50)"),
    ).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<AddDebtModal {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when modal backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(<AddDebtModal {...defaultProps} />);

    // Click outside the modal content
    const modalOverlay = screen.getByTestId("modal-overlay");
    await user.click(modalOverlay);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
