import { fireEvent, render, screen } from "@testing-library/react";

import InviteUserModal from "../InviteUserModal";

// Mock the Modal component
jest.mock("@/components/Modal", () => {
  return function MockModal({
    children,
    isOpen,
    onClose,
    title,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title: string;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Mock the TextField component
jest.mock("@/components/Forms/TextField", () => {
  return function MockTextField({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    placeholder: string;
  }) {
    return (
      <div>
        <label>{label}</label>
        <input
          type="email"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          data-testid="email-input"
        />
      </div>
    );
  };
});

// Mock the Button component
jest.mock("@/components/Button", () => {
  return function MockButton({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant: string;
  }) {
    return (
      <button onClick={onClick} data-testid={`button-${variant}`}>
        {children}
      </button>
    );
  };
});

describe("InviteUserModal", () => {
  const mockOnClose = jest.fn();
  const mockOnInvite = jest.fn();
  const mockOnEmailChange = jest.fn();
  const mockEmail = "test@example.com";

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnInvite.mockClear();
    mockOnEmailChange.mockClear();
  });

  it("renders when open", () => {
    render(
      <InviteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
        email={mockEmail}
        onEmailChange={mockOnEmailChange}
      />,
    );

    expect(screen.getByText("Invite User")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("button-primary")).toBeInTheDocument();
    expect(screen.getByTestId("button-secondary")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <InviteUserModal
        isOpen={false}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
        email={mockEmail}
        onEmailChange={mockOnEmailChange}
      />,
    );

    expect(screen.queryByText("Invite User")).not.toBeInTheDocument();
  });

  it("calls onEmailChange when email input changes", () => {
    render(
      <InviteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
        email={mockEmail}
        onEmailChange={mockOnEmailChange}
      />,
    );

    const emailInput = screen.getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });

    expect(mockOnEmailChange).toHaveBeenCalledWith("new@example.com");
  });

  it("calls onClose when cancel button is clicked", () => {
    render(
      <InviteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
        email={mockEmail}
        onEmailChange={mockOnEmailChange}
      />,
    );

    fireEvent.click(screen.getByTestId("button-secondary"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onInvite when send invitation button is clicked", () => {
    render(
      <InviteUserModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
        email={mockEmail}
        onEmailChange={mockOnEmailChange}
      />,
    );

    fireEvent.click(screen.getByTestId("button-primary"));
    expect(mockOnInvite).toHaveBeenCalled();
  });
});
