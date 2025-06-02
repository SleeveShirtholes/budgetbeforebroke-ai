import { fireEvent, render, screen } from "@testing-library/react";

import ChangeRoleConfirmationModal from "../ChangeRoleConfirmationModal";

describe("ChangeRoleConfirmationModal", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const userEmail = "test@example.com";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders promotion to owner modal correctly", () => {
    render(
      <ChangeRoleConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        newRole="owner"
        userEmail={userEmail}
      />,
    );

    expect(screen.getByText("Promote to Owner")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to promote test@example.com to owner/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("renders demotion to member modal correctly", () => {
    render(
      <ChangeRoleConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        newRole="member"
        userEmail={userEmail}
      />,
    );

    expect(screen.getByText("Change to Member")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to change test@example.com's role to member/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", () => {
    render(
      <ChangeRoleConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        newRole="owner"
        userEmail={userEmail}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when Confirm button is clicked", () => {
    render(
      <ChangeRoleConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        newRole="owner"
        userEmail={userEmail}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("does not render when isOpen is false", () => {
    render(
      <ChangeRoleConfirmationModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        newRole="owner"
        userEmail={userEmail}
      />,
    );

    expect(screen.queryByText("Promote to Owner")).not.toBeInTheDocument();
  });
});
