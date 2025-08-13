import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ToastProvider } from "@/components/Toast";
import EditNicknameModal from "../EditNicknameModal";

// Mock crypto.randomUUID for Jest environment
if (!global.crypto) {
  global.crypto = {} as Crypto;
}
global.crypto.randomUUID = () => "123e4567-e89b-12d3-a456-426614174000";

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
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          data-testid="nickname-input"
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

describe("EditNicknameModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn(async () => Promise.resolve());
  const mockNickname = "Test Account";

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it("renders when open", () => {
    render(
      <ToastProvider>
        <EditNicknameModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          nickname={mockNickname}
        />
      </ToastProvider>,
    );

    expect(screen.getByText("Edit Account Nickname")).toBeInTheDocument();
    expect(screen.getByTestId("nickname-input")).toBeInTheDocument();
    expect(screen.getByTestId("button-primary")).toBeInTheDocument();
    expect(screen.getByTestId("button-secondary")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <ToastProvider>
        <EditNicknameModal
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
          nickname={mockNickname}
        />
      </ToastProvider>,
    );

    expect(screen.queryByText("Edit Account Nickname")).not.toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(
      <ToastProvider>
        <EditNicknameModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          nickname={mockNickname}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByTestId("button-secondary"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onSave when save changes button is clicked", async () => {
    render(
      <ToastProvider>
        <EditNicknameModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          nickname={mockNickname}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByTestId("button-primary"));
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });
});
