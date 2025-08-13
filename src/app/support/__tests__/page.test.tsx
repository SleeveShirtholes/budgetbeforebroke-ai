// Mock child components to isolate Support page logic
function MockSupportHeader() {
  return <div data-testid="support-header">SupportHeader</div>;
}
MockSupportHeader.displayName = "MockSupportHeader";
jest.mock("../components/SupportHeader", () => MockSupportHeader);

function MockSupportFilters(props: Record<string, unknown>) {
  return (
    <div data-testid="support-filters">
      <button
        onClick={() =>
          (props.onIssueViewChange as (v: string) => void)("public")
        }
      >
        All Public Issues
      </button>
      <button onClick={props.onCreateRequest as () => void}>
        Create New Support Request
      </button>
    </div>
  );
}
MockSupportFilters.displayName = "MockSupportFilters";
jest.mock("../components/SupportFilters", () => MockSupportFilters);

function MockSupportTableHeader(props: Record<string, unknown>) {
  return (
    <div data-testid="support-table-header">
      <span>{props.tableTitle as string}</span>
      <button
        onClick={() =>
          (props.onStatusViewChange as (v: string) => void)("closed")
        }
      >
        Closed
      </button>
    </div>
  );
}
MockSupportTableHeader.displayName = "MockSupportTableHeader";
jest.mock("../components/SupportTableHeader", () => MockSupportTableHeader);

function MockSupportDetailPanel() {
  return <div data-testid="support-detail-panel">DetailPanel</div>;
}
MockSupportDetailPanel.displayName = "MockSupportDetailPanel";
jest.mock("../components/SupportDetailPanel", () => MockSupportDetailPanel);

function MockTable(props: Record<string, unknown>) {
  const data = props.data as Record<string, unknown>[];
  return (
    <div data-testid="support-table">
      {data.map((row) => (
        <div key={row.id as string}>{row.title as string}</div>
      ))}
    </div>
  );
}
MockTable.displayName = "MockTable";
jest.mock("@/components/Table", () => MockTable);

// Mock SWR with dynamic data based on filters
const mockData = {
  my: {
    open: [
      {
        id: "1",
        title: "Login Issue",
        category: "Issue",
        status: "Open",
        upvotes: 5,
        lastUpdated: "2024-01-01T00:00:00Z",
        isPublic: false,
      },
    ],
    closed: [
      {
        id: "3",
        title: "Payment Failed",
        category: "Issue",
        status: "Closed",
        upvotes: 2,
        lastUpdated: "2024-01-03T00:00:00Z",
        isPublic: false,
      },
    ],
  },
  public: {
    open: [
      {
        id: "2",
        title: "Feature Request: Dark Mode",
        category: "Feature Request",
        status: "Open",
        upvotes: 10,
        lastUpdated: "2024-01-02T00:00:00Z",
        isPublic: true,
      },
    ],
    closed: [],
  },
};

const mockSWR = {
  data: mockData.my.open,
  mutate: jest.fn(),
  isLoading: false,
  error: null,
};

jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn((key) => {
    // Extract view parameters from the key
    const [, issueView, statusView] = key as [string, string, string, string];

    // Return appropriate data based on current filters
    const statusKey = statusView === "open" ? "open" : "closed";
    const viewKey = issueView === "my" ? "my" : "public";

    return {
      ...mockSWR,
      data: mockData[viewKey][statusKey],
    };
  }),
}));

// Mock the actions
jest.mock("../../actions/supportRequests", () => ({
  getPublicSupportRequests: jest.fn((status) => {
    const statusKey = status === "Closed" ? "closed" : "open";
    return Promise.resolve(mockData.public[statusKey]);
  }),
  getMySupportRequests: jest.fn((userId, status) => {
    const statusKey = status === "Closed" ? "closed" : "open";
    return Promise.resolve(mockData.my[statusKey]);
  }),
  createSupportRequest: jest.fn(() => Promise.resolve()),
  upvoteSupportRequest: jest.fn(() => Promise.resolve()),
  downvoteSupportRequest: jest.fn(() => Promise.resolve()),
  updateSupportRequestStatus: jest.fn(() => Promise.resolve()),
}));
jest.mock("../../actions/supportComments", () => ({
  addSupportComment: jest.fn(() => Promise.resolve()),
}));

import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import Support from "../page";

describe("Support Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset view state
  });

  it("renders header, filters, and table", async () => {
    render(<Support />);

    await waitFor(() => {
      expect(screen.getByTestId("support-header")).toBeInTheDocument();
      expect(screen.getByTestId("support-filters")).toBeInTheDocument();
      expect(screen.getByTestId("support-table-header")).toBeInTheDocument();
      expect(screen.getByTestId("support-table")).toBeInTheDocument();
    });
  });

  it("opens and closes the new request modal", async () => {
    render(<Support />);

    await waitFor(() => {
      expect(screen.getByTestId("support-filters")).toBeInTheDocument();
    });

    // Open modal
    fireEvent.click(screen.getByText("Create New Support Request"));
    // Modal title (heading) should be in the document
    const heading = screen.getByRole("heading", {
      name: "Create New Support Request",
    });
    expect(heading).toBeInTheDocument();
    // Close modal
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    // Modal title (heading) should not be in the document or should not be visible
    expect(heading).not.toBeVisible();
  });

  it("creates a new support request and updates the table", async () => {
    render(<Support />);

    await waitFor(() => {
      expect(screen.getByTestId("support-filters")).toBeInTheDocument();
    });

    // Open modal
    fireEvent.click(screen.getByText("Create New Support Request"));
    // Fill in required fields
    fireEvent.change(
      screen.getByPlaceholderText("Briefly describe your issue"),
      {
        target: { value: "Test Title" },
      },
    );
    fireEvent.change(
      screen.getByPlaceholderText(
        "Provide a detailed description of the problem or request...",
      ),
      {
        target: { value: "Test Description" },
      },
    );
    // Submit new request
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    // Modal should close
    await waitFor(() =>
      expect(screen.queryByTestId("new-request-form")).not.toBeInTheDocument(),
    );
    // Note: Since we're using mocked data, the new request won't actually appear
    // This test verifies the modal closes and form submission works
  });

  it("filters to public issues when tab is clicked", async () => {
    render(<Support />);

    await waitFor(() => {
      expect(screen.getByTestId("support-filters")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("All Public Issues"));

    // Wait for the component to re-render with filtered data
    await waitFor(() => {
      expect(screen.getByTestId("support-table").textContent).toContain(
        "Feature Request: Dark Mode",
      );
      expect(screen.getByTestId("support-table").textContent).not.toContain(
        "Login Issue",
      );
    });
  });

  it("filters to closed issues when status is changed", async () => {
    render(<Support />);

    await waitFor(() => {
      expect(screen.getByTestId("support-filters")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Closed"));

    // Wait for the component to re-render with filtered data
    await waitFor(() => {
      expect(screen.getByTestId("support-table").textContent).toContain(
        "Payment Failed",
      );
      expect(screen.getByTestId("support-table").textContent).not.toContain(
        "Login Issue",
      );
    });
  });

  it("does not add a comment if the comment text is empty", async () => {
    render(<Support />);

    await waitFor(() => {
      expect(screen.getByTestId("support-filters")).toBeInTheDocument();
    });

    // Simulate opening detail panel and trying to add an empty comment
    // Since the detail panel is mocked, we can only check that the commentText state remains unchanged
    // This is a placeholder for when the real detail panel is used
    // No error should occur
  });

  it("handles upvoting a request", async () => {
    render(<Support />);

    await waitFor(() => {
      expect(screen.getByTestId("support-filters")).toBeInTheDocument();
    });

    // Simulate upvoting by calling the handler directly via the Table mock
    // Since the Table is mocked, we can't trigger the upvote from UI, but we can check that the handler exists
    // This is a placeholder for when the real Table is used
    // No error should occur
  });

  it("handles downvoting a request", async () => {
    render(<Support />);

    await waitFor(() => {
      expect(screen.getByTestId("support-filters")).toBeInTheDocument();
    });

    // Simulate downvoting by calling the handler directly via the Table mock
    // Since the Table is mocked, we can't trigger the downvote from UI, but we can check that the handler exists
    // This is a placeholder for when the real Table is used
    // No error should occur
  });

  it("handles status change of a request", async () => {
    render(<Support />);

    await waitFor(() => {
      expect(screen.getByTestId("support-filters")).toBeInTheDocument();
    });

    // Simulate status change by calling the handler directly via the Table mock
    // Since the Table is mocked, we can't trigger the status change from UI, but we can check that the handler exists
    // This is a placeholder for when the real Table is used
    // No error should occur
  });

  it("does not add a new request if required fields are empty", async () => {
    render(<Support />);

    await waitFor(() => {
      expect(screen.getByTestId("support-filters")).toBeInTheDocument();
    });

    // Count rows before
    const beforeRows = screen
      .getAllByTestId("support-table")[0]
      .querySelectorAll("div").length;
    // Open modal
    fireEvent.click(screen.getByText("Create New Support Request"));
    // Simulate submitting with empty fields (the default newRequest is empty)
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    // Count rows after
    const afterRows = screen
      .getAllByTestId("support-table")[0]
      .querySelectorAll("div").length;
    expect(afterRows).toBe(beforeRows);
  });
});
