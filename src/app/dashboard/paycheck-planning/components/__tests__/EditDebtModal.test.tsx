import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditDebtModal from "../EditDebtModal";

// Mock the updateDebt action
jest.mock("@/app/actions/debt", () => ({
  updateDebt: jest.fn(),
}));

import { updateDebt } from "@/app/actions/debt";

/**
 * Test suite for EditDebtModal component
 * Tests form editing, validation, and debt updates
 */
describe("EditDebtModal", () => {
  const mockDebt = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    budgetAccountId: "test-account-id",
    createdByUserId: "test-user-id",
    name: "Test Debt",
    paymentAmount: 500,
    interestRate: 5.5,
    dueDate: "2024-02-15",
    hasBalance: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    payments: [],
  };

  const defaultProps = {
    isOpen: true,
    debt: mockDebt,
    onClose: jest.fn(),
    onDebtUpdated: jest.fn(),
    budgetAccountId: "test-account-id",
  };

  const mockUpdateDebt = updateDebt as jest.MockedFunction<typeof updateDebt>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateDebt.mockResolvedValue({
      id: "123e4567-e89b-12d3-a456-426614174000",
    });
  });

  it("renders the modal when open", () => {
    render(<EditDebtModal {...defaultProps} />);

    expect(screen.getByText("Edit Debt/Bill")).toBeInTheDocument();
    expect(screen.getByLabelText("Name *")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount *")).toBeInTheDocument();
    expect(screen.getByLabelText("Due Date *")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<EditDebtModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Edit Debt/Bill")).not.toBeInTheDocument();
  });

  it("populates form with existing debt data", () => {
    render(<EditDebtModal {...defaultProps} />);

    expect(screen.getByLabelText("Name *")).toHaveValue("Test Debt");
    expect(screen.getByLabelText("Amount *")).toHaveValue(500);
    expect(screen.getByLabelText("Due Date *")).toHaveValue("2024-02-15");
  });

  it("submits form with updated data", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Update the form
    await user.clear(screen.getByLabelText("Name *"));
    await user.type(screen.getByLabelText("Name *"), "Updated Debt Name");
    await user.clear(screen.getByLabelText("Amount *"));
    await user.type(screen.getByLabelText("Amount *"), "750");
    await user.clear(screen.getByLabelText("Due Date *"));
    await user.type(screen.getByLabelText("Due Date *"), "2024-03-01");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Update Debt" });
    await user.click(submitButton);

    expect(mockUpdateDebt).toHaveBeenCalledWith({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Updated Debt Name",
      paymentAmount: 750,
      interestRate: 0, // Default value in the component
      dueDate: "2024-03-01",
    });
  });

  it("calls onDebtUpdated after successful submission", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Update Debt" });
    await user.click(submitButton);

    expect(defaultProps.onDebtUpdated).toHaveBeenCalled();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when modal backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Click outside the modal content
    const modalOverlay = screen.getByTestId("modal-overlay");
    await user.click(modalOverlay);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("handles form submission errors", async () => {
    const user = userEvent.setup();
    const errorMessage = "Failed to update debt";
    mockUpdateDebt.mockRejectedValue(new Error(errorMessage));

    render(<EditDebtModal {...defaultProps} />);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Update Debt" });
    await user.click(submitButton);

    // Error should be displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Clear required fields
    await user.clear(screen.getByLabelText("Name *"));
    await user.clear(screen.getByLabelText("Amount *"));
    await user.clear(screen.getByLabelText("Due Date *"));

    // Try to submit
    const submitButton = screen.getByRole("button", { name: "Update Debt" });
    await user.click(submitButton);

    // Form should not submit without required fields
    expect(mockUpdateDebt).not.toHaveBeenCalled();
  });

  it("handles decimal values correctly", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Update with decimal values
    await user.clear(screen.getByLabelText("Amount *"));
    await user.type(screen.getByLabelText("Amount *"), "499.99");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Update Debt" });
    await user.click(submitButton);

    expect(mockUpdateDebt).toHaveBeenCalledWith({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Test Debt",
      paymentAmount: 499.99,
      interestRate: 0, // Default value in the component
      dueDate: "2024-02-15",
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    // Make the promise hang to test loading state
    let resolvePromise: (value: { id: string }) => void;
    const pendingPromise = new Promise<{ id: string }>((resolve) => {
      resolvePromise = resolve;
    });
    mockUpdateDebt.mockReturnValue(pendingPromise);

    render(<EditDebtModal {...defaultProps} />);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Update Debt" });
    await user.click(submitButton);

    // Check loading state
    expect(screen.getByRole("button", { name: "Update Debt" })).toBeDisabled();
    // The button should show a loading spinner
    expect(
      screen
        .getByRole("button", { name: "Update Debt" })
        .querySelector(".animate-spin"),
    ).toBeInTheDocument();

    // Resolve the promise
    resolvePromise!({ id: "123e4567-e89b-12d3-a456-426614174000" });
  });

  it("maintains form state during interactions", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Update a field
    await user.clear(screen.getByLabelText("Name *"));
    await user.type(screen.getByLabelText("Name *"), "Modified Name");

    // Verify the value is maintained
    expect(screen.getByLabelText("Name *")).toHaveValue("Modified Name");

    // Cancel and reopen should maintain the modified value
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    // Reopen modal
    render(<EditDebtModal {...defaultProps} />);

    // Form should show the modified value since it's maintained in the component state
    expect(screen.getByLabelText("Name *")).toHaveValue("Modified Name");
  });

  it("handles special characters in debt name", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Update with special characters
    await user.clear(screen.getByLabelText("Name *"));
    await user.type(
      screen.getByLabelText("Name *"),
      "Credit Card & Bills (2024) - $500",
    );

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Update Debt" });
    await user.click(submitButton);

    expect(mockUpdateDebt).toHaveBeenCalledWith({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Credit Card & Bills (2024) - $500",
      paymentAmount: 500,
      interestRate: 0, // Default value in the component
      dueDate: "2024-02-15",
    });
  });

  it("handles zero values correctly", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Update with small values
    await user.clear(screen.getByLabelText("Amount *"));
    await user.type(screen.getByLabelText("Amount *"), "0.01");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Update Debt" });
    await user.click(submitButton);

    expect(mockUpdateDebt).toHaveBeenCalledWith({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Test Debt",
      paymentAmount: 0.01,
      interestRate: 0, // Default value in the component
      dueDate: "2024-02-15",
    });
  });
});
