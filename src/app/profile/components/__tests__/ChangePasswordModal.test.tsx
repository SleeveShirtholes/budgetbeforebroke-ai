import { fireEvent, render, screen } from "@testing-library/react";

import ChangePasswordModal from "../ChangePasswordModal";

describe("ChangePasswordModal", () => {
  const mockOnChangePassword = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when creating a new password", () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onChangePassword={mockOnChangePassword}
        isLoading={false}
        hasPassword={false}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Create Password" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm New Password/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Password" }),
    ).toBeInTheDocument();
  });

  it("renders correctly when changing an existing password", () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onChangePassword={mockOnChangePassword}
        isLoading={false}
        hasPassword={true}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Change Password" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Current Password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm New Password/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Change Password" }),
    ).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onChangePassword={mockOnChangePassword}
        isLoading={false}
        hasPassword={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows loading state when isLoading is true (create)", () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onChangePassword={mockOnChangePassword}
        isLoading={true}
        hasPassword={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Creating..." })).toBeDisabled();
  });

  it("shows loading state when isLoading is true (change)", () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onChangePassword={mockOnChangePassword}
        isLoading={true}
        hasPassword={true}
      />,
    );

    expect(screen.getByRole("button", { name: "Changing..." })).toBeDisabled();
  });
});
