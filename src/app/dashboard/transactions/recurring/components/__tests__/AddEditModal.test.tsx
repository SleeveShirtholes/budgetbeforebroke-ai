import { render, screen } from "@testing-library/react";

import { RecurringDebt } from "@/types/debt";
import userEvent from "@testing-library/user-event";
import AddEditModal from "../AddEditModal";

const mockFormData: Omit<RecurringDebt, "id"> = {
  name: "Test Debt",
  balance: "1000",
  interestRate: "5",
  dueDate: "2024-04-01",
  payments: [],
};

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();
const mockOnChange = jest.fn();

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
        editingId={null}
        formData={mockFormData}
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByText("Add New Recurring")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.getByText("Add and Add Another")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders edit mode correctly", () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingId="1"
        formData={mockFormData}
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByText("Edit Recurring")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
    expect(screen.queryByText("Add and Add Another")).not.toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingId={null}
        formData={mockFormData}
        onChange={mockOnChange}
      />,
    );

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onSubmit with addAnother=true when Add and Add Another is clicked", async () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingId={null}
        formData={mockFormData}
        onChange={mockOnChange}
      />,
    );

    const addAnotherButton = screen.getByText("Add and Add Another");
    await userEvent.click(addAnotherButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.anything(), true);
  });

  it("calls onSubmit without addAnother when Add/Save button is clicked", async () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingId={null}
        formData={mockFormData}
        onChange={mockOnChange}
      />,
    );

    const submitButton = screen.getByText("Add");
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.anything(), undefined);
  });

  it("renders DebtForm with correct props", () => {
    render(
      <AddEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingId={null}
        formData={mockFormData}
        onChange={mockOnChange}
      />,
    );

    // Check if form fields are rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/balance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });
});
