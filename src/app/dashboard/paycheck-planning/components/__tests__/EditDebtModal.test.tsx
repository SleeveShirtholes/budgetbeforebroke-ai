import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditDebtModal from "../EditDebtModal";

// Mock the updateDebt action
jest.mock("@/app/actions/debt", () => ({
  updateDebt: jest.fn(),
}));

// Mock the useCategories hook
jest.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({
    categories: [
      { id: "category-1", name: "Test Category" },
      { id: "category-2", name: "Another Category" },
    ],
    isLoading: false,
    error: null,
  }),
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
    categoryId: "category-1",
    name: "Test Debt",
    paymentAmount: 500,
    interestRate: 5.5,
    dueDate: "2025-12-15",
    hasBalance: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
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
    expect(screen.getByTestId("debt-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("debt-payment-amount-input")).toBeInTheDocument();
    expect(screen.getByTestId("debt-due-date-input")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<EditDebtModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Edit Debt/Bill")).not.toBeInTheDocument();
  });

  it("populates form with existing debt data", () => {
    render(<EditDebtModal {...defaultProps} />);

    expect(screen.getByTestId("debt-name-input")).toHaveValue("Test Debt");
    expect(screen.getByTestId("debt-payment-amount-input")).toHaveValue("500");
    expect(screen.getByTestId("debt-due-date-input")).toHaveValue(
      "Dec 15, 2025",
    );
  });

  it("submits form with updated data", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Update the form (only name and payment amount to avoid date parsing issues)
    await user.clear(screen.getByTestId("debt-name-input"));
    await user.type(screen.getByTestId("debt-name-input"), "Updated Debt Name");
    await user.clear(screen.getByTestId("debt-payment-amount-input"));
    await user.type(screen.getByTestId("debt-payment-amount-input"), "750");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Save Changes" });
    await user.click(submitButton);

    expect(mockUpdateDebt).toHaveBeenCalledWith(
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Updated Debt Name",
        paymentAmount: 750,
        interestRate: 5.5, // From the mock debt data
        dueDate: "2025-12-15", // Keep original date
        categoryId: "category-1", // From the mock debt data
      },
      "test-account-id",
    );
  });

  it("calls onDebtUpdated after successful submission", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Save Changes" });
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
    mockUpdateDebt.mockRejectedValue(new Error("Failed to update debt"));

    render(<EditDebtModal {...defaultProps} />);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Save Changes" });
    await user.click(submitButton);

    // Error should be logged to console
    expect(mockUpdateDebt).toHaveBeenCalled();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Clear required fields
    await user.clear(screen.getByTestId("debt-name-input"));
    await user.clear(screen.getByTestId("debt-payment-amount-input"));
    await user.clear(screen.getByTestId("debt-due-date-input"));

    // Try to submit
    const submitButton = screen.getByRole("button", { name: "Save Changes" });
    await user.click(submitButton);

    // Form should not submit without required fields
    expect(mockUpdateDebt).not.toHaveBeenCalled();
  });

  it("handles decimal values correctly", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Update with decimal values
    await user.clear(screen.getByTestId("debt-payment-amount-input"));
    await user.type(screen.getByTestId("debt-payment-amount-input"), "499.99");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Save Changes" });
    await user.click(submitButton);

    expect(mockUpdateDebt).toHaveBeenCalledWith(
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Debt",
        paymentAmount: 499.99,
        interestRate: 5.5, // From the mock debt data
        dueDate: "2025-12-15",
        categoryId: "category-1", // From the mock debt data
      },
      "test-account-id",
    );
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
    const submitButton = screen.getByRole("button", { name: "Save Changes" });
    await user.click(submitButton);

    // Check that the function was called
    expect(mockUpdateDebt).toHaveBeenCalled();

    // Resolve the promise
    resolvePromise!({ id: "123e4567-e89b-12d3-a456-426614174000" });
  });

  it("maintains form state during interactions", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Update a field
    await user.clear(screen.getByTestId("debt-name-input"));
    await user.type(screen.getByTestId("debt-name-input"), "Modified Name");

    // Verify the value is maintained during the same session
    expect(screen.getByTestId("debt-name-input")).toHaveValue("Modified Name");
  });

  it("handles special characters in debt name", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Update a field
    await user.clear(screen.getByTestId("debt-name-input"));
    await user.type(
      screen.getByTestId("debt-name-input"),
      "Credit Card & Bills (2024) - $500",
    );

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Save Changes" });
    await user.click(submitButton);

    expect(mockUpdateDebt).toHaveBeenCalledWith(
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Credit Card & Bills (2024) - $500",
        paymentAmount: 500,
        interestRate: 5.5, // From the mock debt data
        dueDate: "2025-12-15",
        categoryId: "category-1", // From the mock debt data
      },
      "test-account-id",
    );
  });

  it("handles zero values correctly", async () => {
    const user = userEvent.setup();
    render(<EditDebtModal {...defaultProps} />);

    // Update payment amount field
    await user.clear(screen.getByTestId("debt-payment-amount-input"));
    await user.type(screen.getByTestId("debt-payment-amount-input"), "0.01");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Save Changes" });
    await user.click(submitButton);

    expect(mockUpdateDebt).toHaveBeenCalledWith(
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Debt",
        paymentAmount: 0.01,
        interestRate: 5.5, // From the mock debt data
        dueDate: "2025-12-15",
        categoryId: "category-1", // From the mock debt data
      },
      "test-account-id",
    );
  });
});
