import { render, screen } from "@testing-library/react";

import { Debt } from "@/types/debt";
import userEvent from "@testing-library/user-event";
import AddEditModal from "../AddEditModal";

const mockDebt: Debt = {
  id: "1",
  budgetAccountId: "account-1",
  createdByUserId: "user-1",
  name: "Test Debt",
  balance: 1000,
  interestRate: 5,
  dueDate: new Date("2024-04-01"),
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  payments: [],
};

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();

describe("AddEditModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders add mode correctly", () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingDebt={null}
      />,
    );

    expect(screen.getByText("Add New Debt")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders edit mode correctly", () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingDebt={mockDebt}
      />,
    );

    expect(screen.getByText("Edit Debt")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingDebt={null}
      />,
    );

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("renders DebtForm with correct props in add mode", () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingDebt={null}
      />,
    );

    // Check if form fields are rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/balance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it("renders DebtForm with correct props in edit mode", () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingDebt={mockDebt}
      />,
    );

    // Check if form fields are rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/balance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingDebt={null}
        isLoading={true}
      />,
    );

    // Check that the submit button is disabled
    const submitButton = screen.getByRole("button", { name: "Add" });
    expect(submitButton).toBeDisabled();
  });
});
