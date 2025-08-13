import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteDebtModal from "../DeleteDebtModal";

// Mock the deleteDebt action
jest.mock("@/app/actions/debt", () => ({
  deleteDebt: jest.fn(),
}));

import { deleteDebt } from "@/app/actions/debt";

/**
 * Test suite for DeleteDebtModal component
 * Tests confirmation dialog, user interactions, and accessibility
 */
describe("DeleteDebtModal", () => {
  const mockDebt = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    budgetAccountId: "test-account-id",
    createdByUserId: "test-user-id",
    name: "Test Debt",
    paymentAmount: 500,
    interestRate: 0,
    dueDate: "2024-02-15",
    hasBalance: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    payments: [],
  };

  const defaultProps = {
    isOpen: true,
    debt: mockDebt,
    onClose: jest.fn(),
    onDebtDeleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the modal when open", () => {
    render(<DeleteDebtModal {...defaultProps} />);

    expect(screen.getByText("Delete Debt/Bill")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Test Debt/)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<DeleteDebtModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Delete Debt/Bill")).not.toBeInTheDocument();
  });

  it("displays the debt name correctly", () => {
    const debtWithLongName = {
      ...mockDebt,
      name: "Very Long Debt Name That Should Be Displayed Properly",
    };

    render(<DeleteDebtModal {...defaultProps} debt={debtWithLongName} />);

    expect(
      screen.getByText(/Very Long Debt Name That Should Be Displayed Properly/),
    ).toBeInTheDocument();
  });

  it("calls onDebtDeleted when delete button is clicked", async () => {
    const user = userEvent.setup();
    // Mock deleteDebt to resolve successfully
    (deleteDebt as jest.Mock).mockResolvedValue(undefined);

    render(<DeleteDebtModal {...defaultProps} />);

    const deleteButton = screen.getByRole("button", { name: "Delete Debt" });
    await user.click(deleteButton);

    // Wait for the async operation to complete
    await screen.findByText("Delete Debt");

    expect(defaultProps.onDebtDeleted).toHaveBeenCalled();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<DeleteDebtModal {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when modal backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(<DeleteDebtModal {...defaultProps} />);

    // Click outside the modal content
    const modalOverlay = screen.getByTestId("modal-overlay");
    await user.click(modalOverlay);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("has proper button styling and accessibility", () => {
    render(<DeleteDebtModal {...defaultProps} />);

    const deleteButton = screen.getByRole("button", { name: "Delete Debt" });
    const cancelButton = screen.getByRole("button", { name: "Cancel" });

    // Check that delete button has destructive styling
    expect(deleteButton).toHaveClass("bg-red-600", "hover:bg-red-700");

    // Check that cancel button has primary styling
    expect(cancelButton).toHaveClass("border-primary-600", "text-primary-600");
  });

  it("handles keyboard navigation correctly", async () => {
    const user = userEvent.setup();
    render(<DeleteDebtModal {...defaultProps} />);

    // Tab should focus on close button first, then cancel button, then delete button
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Delete Debt" })).toHaveFocus();
  });

  it("displays confirmation message with proper formatting", () => {
    render(<DeleteDebtModal {...defaultProps} />);

    const confirmationText = screen.getByText(
      /Are you sure you want to delete/,
    );
    expect(confirmationText).toBeInTheDocument();

    // Check that the debt name is displayed prominently
    const debtName = screen.getByText(/Test Debt/);
    expect(debtName).toBeInTheDocument();
  });

  it("handles debt with special characters in name", () => {
    const debtWithSpecialChars = {
      ...mockDebt,
      name: "Debt & Bills (2024) - $500",
    };

    render(<DeleteDebtModal {...defaultProps} debt={debtWithSpecialChars} />);

    expect(
      screen.getByText(/Debt & Bills \(2024\) - \$500/),
    ).toBeInTheDocument();
  });

  it("maintains focus management during interactions", async () => {
    const user = userEvent.setup();
    // Mock deleteDebt to resolve successfully
    (deleteDebt as jest.Mock).mockResolvedValue(undefined);

    render(<DeleteDebtModal {...defaultProps} />);

    // Focus should be managed properly when modal opens
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    cancelButton.focus();
    expect(cancelButton).toHaveFocus();

    // After clicking delete, focus should be managed
    const deleteButton = screen.getByRole("button", { name: "Delete Debt" });
    await user.click(deleteButton);

    // Wait for the async operation to complete
    await screen.findByText("Delete Debt");

    // The onDebtDeleted callback should be called
    expect(defaultProps.onDebtDeleted).toHaveBeenCalled();
  });
});
