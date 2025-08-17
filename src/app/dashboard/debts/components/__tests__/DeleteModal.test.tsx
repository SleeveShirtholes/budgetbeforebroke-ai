import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import DeleteModal from "../DeleteModal";

const mockOnClose = jest.fn();
const mockOnConfirm = jest.fn();

describe("DeleteModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all elements", () => {
    render(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByText("Delete Debt")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this debt/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /All payment history associated with this debt will be permanently removed/i,
      ),
    ).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    render(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onConfirm when delete button is clicked", async () => {
    render(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const deleteButton = screen.getByText("Delete");
    await userEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("shows warning message about permanent deletion", () => {
    render(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(
      screen.getByText(/This action cannot be undone/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /All payment history associated with this debt will be permanently removed/i,
      ),
    ).toBeInTheDocument();
  });

  it("has correct button variants", () => {
    render(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const cancelButton = screen.getByText("Cancel");
    const deleteButton = screen.getByText("Delete");

    expect(cancelButton).toHaveClass(
      "border-2",
      "border-primary-600",
      "text-primary-600",
    );
    expect(deleteButton).toHaveClass("bg-red-600", "text-white");
  });
});
