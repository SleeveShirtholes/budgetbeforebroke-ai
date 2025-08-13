import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SupportRequest, SupportStatus } from "../../types";
import SupportDetailPanel from "../SupportDetailPanel";

// Mock the AddCommentForm component
jest.mock("../AddCommentForm", () => {
  return function MockAddCommentForm({ onSubmit, loading }: unknown) {
    return (
      <div data-testid="add-comment-form">
        <textarea
          data-testid="comment-textarea"
          placeholder="Type your comment..."
        />
        <button
          data-testid="submit-comment"
          onClick={() => onSubmit("Test comment")}
          disabled={loading}
        >
          Submit Comment
        </button>
      </div>
    );
  };
});

describe("SupportDetailPanel", () => {
  const mockRequest: SupportRequest = {
    id: "test-request-1",
    title: "Test Support Request",
    description: "This is a test support request description",
    category: "Feature Request",
    status: "Open" as SupportStatus,
    upvotes: 5,
    downvotes: 2,
    isPublic: true,
    lastUpdated: "2024-01-01T00:00:00Z",
    user: "Test User",
    comments: [
      {
        id: "comment-1",
        text: "This is a test comment",
        user: "Test User",
        timestamp: "2024-01-01T01:00:00Z",
      },
      {
        id: "comment-2",
        text: "This is another test comment",
        user: "Another User",
        timestamp: "2024-01-01T02:00:00Z",
      },
    ],
  };

  const mockSupportStatusOptions = [
    { label: "Open", value: "Open" },
    { label: "In Progress", value: "In Progress" },
    { label: "Closed", value: "Closed" },
  ];

  const defaultProps = {
    request: mockRequest,
    onUpvote: jest.fn(),
    onDownvote: jest.fn(),
    onStatusChange: jest.fn(),
    onAddComment: jest.fn(),
    supportStatusOptions: mockSupportStatusOptions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the ticket details header", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    expect(screen.getByText("Ticket Details")).toBeInTheDocument();
  });

  it("displays the ticket details header", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    expect(screen.getByText("Ticket Details")).toBeInTheDocument();
  });

  it("displays voting buttons with correct counts", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    expect(screen.getByText("5")).toBeInTheDocument(); // upvotes
    expect(screen.getByText("2")).toBeInTheDocument(); // downvotes
  });

  it("calls onUpvote when upvote button is clicked", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    const upvoteButton = screen.getByLabelText("Upvote");
    fireEvent.click(upvoteButton);
    expect(defaultProps.onUpvote).toHaveBeenCalledWith("test-request-1");
  });

  it("calls onDownvote when downvote button is clicked", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    const downvoteButton = screen.getByLabelText("Downvote");
    fireEvent.click(downvoteButton);
    expect(defaultProps.onDownvote).toHaveBeenCalledWith("test-request-1");
  });

  it("displays metadata correctly", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    expect(screen.getByText("Category:")).toBeInTheDocument();
    expect(screen.getByText("Feature Request")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Visibility:")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Last Updated:")).toBeInTheDocument();
  });

  it("displays the request description", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test support request description"),
    ).toBeInTheDocument();
  });

  it("displays comments section with correct count", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
  });

  it("displays all comments with user and timestamp", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    expect(screen.getByText("This is a test comment")).toBeInTheDocument();
    expect(
      screen.getByText("This is another test comment"),
    ).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Another User")).toBeInTheDocument();
  });

  it("displays 'No comments yet' when there are no comments", () => {
    const requestWithoutComments = {
      ...mockRequest,
      comments: [],
    };
    render(
      <SupportDetailPanel {...defaultProps} request={requestWithoutComments} />,
    );
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("(0)")).toBeInTheDocument();
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("renders the add comment form", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    expect(screen.getByTestId("add-comment-form")).toBeInTheDocument();
    expect(screen.getByText("Add a comment")).toBeInTheDocument();
  });

  it("calls onAddComment when comment is submitted", async () => {
    render(<SupportDetailPanel {...defaultProps} />);
    const submitButton = screen.getByTestId("submit-comment");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onAddComment).toHaveBeenCalledWith(
        "test-request-1",
        "Test comment",
      );
    });
  });

  it("does not show request ID by default", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    expect(screen.queryByText("ID:")).not.toBeInTheDocument();
    expect(screen.queryByText("test-request-1")).not.toBeInTheDocument();
  });

  it("displays private visibility correctly", () => {
    const privateRequest = {
      ...mockRequest,
      isPublic: false,
    };
    render(<SupportDetailPanel {...defaultProps} request={privateRequest} />);
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("renders status select with correct placeholder", () => {
    render(<SupportDetailPanel {...defaultProps} />);
    const statusSelect = screen.getByPlaceholderText("Open");
    expect(statusSelect).toBeInTheDocument();
  });
});
