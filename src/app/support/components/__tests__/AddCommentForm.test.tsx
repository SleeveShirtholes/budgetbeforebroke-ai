import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddCommentForm from "../AddCommentForm";

describe("AddCommentForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with textarea and submit button", () => {
    render(<AddCommentForm onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId("add-comment-form")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type your comment..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Submit Comment")).toBeInTheDocument();
  });

  it("submits form with comment text when valid", async () => {
    render(<AddCommentForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Type your comment...");
    const submitButton = screen.getByText("Submit Comment");

    fireEvent.change(textarea, { target: { value: "This is a test comment" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith("This is a test comment");
    });
  });

  it("renders with correct label", () => {
    render(<AddCommentForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText("Your Comment")).toBeInTheDocument();
  });

  it("renders with correct rows attribute", () => {
    render(<AddCommentForm onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText("Type your comment...");
    expect(textarea).toHaveAttribute("rows", "3");
  });

  it("displays error message when error prop is provided", () => {
    const errorMessage = "Failed to submit comment";
    render(<AddCommentForm onSubmit={mockOnSubmit} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("clears form after successful submission", async () => {
    render(<AddCommentForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Type your comment...");
    const submitButton = screen.getByText("Submit Comment");

    fireEvent.change(textarea, { target: { value: "This is a test comment" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith("This is a test comment");
    });

    // Form should be cleared after submission
    expect(textarea).toHaveValue("");
  });

  it("renders form with correct structure", () => {
    render(<AddCommentForm onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId("add-comment-form")).toBeInTheDocument();
    expect(screen.getByText("Your Comment")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type your comment..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Submit Comment")).toBeInTheDocument();
  });

  it("shows loading state when loading prop is true", () => {
    render(<AddCommentForm onSubmit={mockOnSubmit} loading={true} />);

    const submitButton = screen.getByRole("button", { name: "Submit Comment" });
    // The Button component should handle the loading state internally
    expect(submitButton).toBeDisabled();
  });
});
