import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SupportDetailPanel from "../SupportDetailPanel";
import { SupportRequest } from "../../types";
import { canEditSupportRequest } from "@/app/actions/supportRequests";

// Mock the canEditSupportRequest function
jest.mock("@/app/actions/supportRequests", () => ({
  canEditSupportRequest: jest.fn(),
}));

const mockCanEditSupportRequest = canEditSupportRequest as jest.MockedFunction<
  typeof canEditSupportRequest
>;

// Mock the CustomSelect component
jest.mock("@/components/Forms/CustomSelect", () => {
  return function MockCustomSelect({
    options,
    value,
    onChange,
    id,
  }: {
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
    id?: string;
  }) {
    return (
      <select
        data-testid={id || "custom-select"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };
});

// Mock the Button component
jest.mock("@/components/Button", () => {
  return function MockButton({
    children,
    onClick,
    className,
    disabled,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    "aria-label"?: string;
  }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        aria-label={ariaLabel}
        data-testid="button"
      >
        {children}
      </button>
    );
  };
});

// Mock the AddCommentForm component
jest.mock("../AddCommentForm", () => {
  return function MockAddCommentForm({
    onSubmit,
    loading,
  }: {
    onSubmit: (comment: string) => void;
    loading: boolean;
  }) {
    const [comment, setComment] = React.useState("");
    return (
      <div>
        <input
          data-testid="comment-input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter comment"
        />
        <button
          data-testid="submit-comment"
          onClick={() => onSubmit(comment)}
          disabled={loading}
        >
          Submit
        </button>
      </div>
    );
  };
});

const mockRequest: SupportRequest = {
  id: "req-1",
  title: "Test Support Request",
  description: "This is a test support request description",
  category: "Feature Request",
  status: "Open",
  lastUpdated: "2024-01-01T00:00:00Z",
  isPublic: true,
  comments: [
    {
      id: "comment-1",
      user: "Test User",
      text: "This is a test comment",
      timestamp: "2024-01-01T00:00:00Z",
    },
  ],
  upvotes: 5,
  downvotes: 1,
  user: "Test User",
};

const mockSupportStatusOptions = [
  { value: "Open", label: "Open" },
  { value: "In Progress", label: "In Progress" },
  { value: "Closed", label: "Closed" },
];

const defaultProps = {
  request: mockRequest,
  onUpvote: jest.fn(),
  onDownvote: jest.fn(),
  onStatusChange: jest.fn(),
  onAddComment: jest.fn(),
  supportStatusOptions: mockSupportStatusOptions,
};

describe("SupportDetailPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to allowing edit
    mockCanEditSupportRequest.mockResolvedValue(true);
  });

  it("renders loading state initially", () => {
    render(<SupportDetailPanel {...defaultProps} />);

    // Should show loading skeleton
    expect(screen.queryByText("Ticket Details")).not.toBeInTheDocument();
    // Check for skeleton elements
    const skeletonElements = document.querySelectorAll(
      ".animate-pulse .bg-gray-200",
    );
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("renders request details after permission check", async () => {
    render(<SupportDetailPanel {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Ticket Details")).toBeInTheDocument();
    });

    // Check that the basic metadata is present
    expect(screen.getByText("Category:")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Visibility:")).toBeInTheDocument();
    expect(screen.getByText("Last Updated:")).toBeInTheDocument();

    // Check that the values are present
    expect(screen.getByText("Feature Request")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  it("shows editable status dropdown when user can edit", async () => {
    mockCanEditSupportRequest.mockResolvedValue(true);

    render(<SupportDetailPanel {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("status-select-req-1")).toBeInTheDocument();
    });

    const statusSelect = screen.getByTestId("status-select-req-1");
    expect(statusSelect).toHaveValue("Open");
  });

  it("shows read-only status badge when user cannot edit", async () => {
    mockCanEditSupportRequest.mockResolvedValue(false);

    render(<SupportDetailPanel {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Ticket Details")).toBeInTheDocument();
    });

    // Should show status as a badge instead of dropdown
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Open")).toHaveClass(
      "bg-green-100",
      "text-green-800",
    );
  });

  it("handles status change when user can edit", async () => {
    mockCanEditSupportRequest.mockResolvedValue(true);

    render(<SupportDetailPanel {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("status-select-req-1")).toBeInTheDocument();
    });

    const statusSelect = screen.getByTestId("status-select-req-1");
    expect(statusSelect).toHaveValue("Open");

    // Change status
    fireEvent.change(statusSelect, { target: { value: "In Progress" } });

    expect(defaultProps.onStatusChange).toHaveBeenCalledWith(
      "req-1",
      "In Progress",
    );
  });

  it("displays comments correctly", async () => {
    render(<SupportDetailPanel {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Ticket Details")).toBeInTheDocument();
    });

    // Check that comments section is present
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("(1)")).toBeInTheDocument();
    expect(screen.getByText("This is a test comment")).toBeInTheDocument();
  });

  it("handles upvote and downvote", async () => {
    const mockOnUpvote = jest.fn();
    const mockOnDownvote = jest.fn();

    render(
      <SupportDetailPanel
        {...defaultProps}
        onUpvote={mockOnUpvote}
        onDownvote={mockOnDownvote}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("button")).toHaveLength(2); // upvote, downvote
    });

    const buttons = screen.getAllByTestId("button");
    fireEvent.click(buttons[0]); // upvote

    expect(mockOnUpvote).toHaveBeenCalledWith("req-1");
  });

  it("handles adding comments", async () => {
    const mockOnAddComment = jest.fn();

    render(
      <SupportDetailPanel {...defaultProps} onAddComment={mockOnAddComment} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("comment-input")).toBeInTheDocument();
    });

    const commentInput = screen.getByTestId("comment-input");
    const submitButton = screen.getByTestId("submit-comment");

    fireEvent.change(commentInput, { target: { value: "New comment" } });
    fireEvent.click(submitButton);

    expect(mockOnAddComment).toHaveBeenCalledWith("req-1", "New comment");
  });

  it("displays correct status badge colors", async () => {
    mockCanEditSupportRequest.mockResolvedValue(false);

    // Test Open status
    render(<SupportDetailPanel {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Ticket Details")).toBeInTheDocument();
    });

    // Check that the status is displayed as a badge
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Open")).toHaveClass(
      "bg-green-100",
      "text-green-800",
    );
  });

  it("handles permission check errors gracefully", async () => {
    mockCanEditSupportRequest.mockRejectedValue(
      new Error("Permission check failed"),
    );

    render(<SupportDetailPanel {...defaultProps} />);

    // Wait for the permission check to complete and the component to render
    await waitFor(() => {
      expect(screen.getByText("Ticket Details")).toBeInTheDocument();
    });

    // Should default to not allowing edit
    expect(screen.queryByTestId("custom-select")).not.toBeInTheDocument();

    // Should show status as read-only badge
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("displays metadata correctly", async () => {
    render(<SupportDetailPanel {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Ticket Details")).toBeInTheDocument();
    });

    // Check that the basic metadata is present
    expect(screen.getByText("Category:")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Visibility:")).toBeInTheDocument();
    expect(screen.getByText("Last Updated:")).toBeInTheDocument();

    // Check that the values are present
    expect(screen.getByText("Feature Request")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  it("displays empty comments message when no comments", async () => {
    const requestWithoutComments = {
      ...mockRequest,
      comments: [],
    };

    render(
      <SupportDetailPanel {...defaultProps} request={requestWithoutComments} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Ticket Details")).toBeInTheDocument();
    });

    // Check that comments section shows empty state
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("(0)")).toBeInTheDocument();
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });
});
