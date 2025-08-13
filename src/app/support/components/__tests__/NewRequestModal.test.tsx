import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import NewRequestModal from "../NewRequestModal";

describe("NewRequestModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the modal title", () => {
    render(<NewRequestModal {...defaultProps} />);
    expect(screen.getByText("Create New Support Request")).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    render(<NewRequestModal {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Briefly describe your issue"),
    ).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Provide a detailed description of the problem or request...",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        "Make this request public (visible to other users)",
      ),
    ).toBeInTheDocument();
  });

  it("submits form with correct data when all fields are filled", async () => {
    render(<NewRequestModal {...defaultProps} />);

    // Fill in the form
    fireEvent.change(
      screen.getByPlaceholderText("Briefly describe your issue"),
      { target: { value: "Test Title" } },
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Provide a detailed description of the problem or request...",
      ),
      { target: { value: "Test Description" } },
    );

    // Submit the form
    const form = screen.getByTestId("new-request-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Test Title",
        description: "Test Description",
        category: "Issue",
        status: "Open",
        isPublic: false,
      });
    });
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<NewRequestModal {...defaultProps} />);
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("does not render when isOpen is false", () => {
    render(<NewRequestModal {...defaultProps} isOpen={false} />);
    expect(
      screen.queryByText("Create New Support Request"),
    ).not.toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    render(<NewRequestModal {...defaultProps} />);

    // Submit form without filling required fields
    const form = screen.getByTestId("new-request-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
