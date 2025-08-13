import { fireEvent, render, screen } from "@testing-library/react";

import { DeleteIncomeSourceModal } from "../DeleteIncomeSourceModal";

describe("DeleteIncomeSourceModal", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders confirmation message and buttons", () => {
    render(
      <DeleteIncomeSourceModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />,
    );

    expect(screen.getByText("Delete Income Source")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this income source?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", () => {
    render(
      <DeleteIncomeSourceModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onConfirm when Delete button is clicked", () => {
    render(
      <DeleteIncomeSourceModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("disables buttons and shows loading state when isDeleting is true", () => {
    render(
      <DeleteIncomeSourceModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={true}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    const deleteButton = screen.getByRole("button", { name: /delete/i });

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
    expect(deleteButton.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
