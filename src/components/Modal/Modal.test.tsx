import { fireEvent, render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

describe("Modal Component", () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: "Test Modal",
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders when isOpen is true", () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("doesn't render when isOpen is false", () => {
    render(<Modal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
    expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
  });

  it("calls onClose when clicking the close button", async () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when pressing Escape key", () => {
    render(<Modal {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking the overlay", async () => {
    render(<Modal {...defaultProps} />);

    const overlay = screen.getByTestId("modal-overlay");
    await userEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders with custom max width", () => {
    render(<Modal {...defaultProps} maxWidth="xl" />);

    const modalContent = screen.getByTestId("modal-content");
    expect(modalContent).toHaveClass("max-w-xl");
  });

  it("renders footer buttons when provided", () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        footerButtons={<button>Test Button</button>}
      />,
    );

    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("has proper flexbox layout for viewport constraints", () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        footerButtons={<button>Test Button</button>}
      >
        <div>Test content</div>
      </Modal>,
    );

    const modalContent = screen.getByTestId("modal-content");

    // Check that the modal has flexbox layout
    expect(modalContent).toHaveClass("flex", "flex-col");

    // Check that the modal has proper max height constraints
    expect(modalContent).toHaveClass("max-h-[calc(100vh-4rem)]");

    // Check that content area is flexible
    const contentArea = modalContent.querySelector("div:nth-child(2)");
    expect(contentArea).toHaveClass("flex-1", "overflow-y-auto");

    // Check that footer is not shrinkable
    const footer = modalContent.querySelector("div:nth-child(3)");
    expect(footer).toHaveClass("flex-shrink-0");
  });

  it("manages body overflow style", () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" />,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("unset");
  });
});
