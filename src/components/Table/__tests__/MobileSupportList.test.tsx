import { render, screen, fireEvent } from "@testing-library/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import MobileSupportList from "../MobileSupportList";
import { ColumnDef } from "../types";

describe("MobileSupportList", () => {
  const mockData = [
    {
      id: "1",
      title: "Login issue",
      category: "Authentication",
      status: "Open",
      lastUpdated: "2024-01-15T10:30:00Z",
      upvotes: "5",
    },
    {
      id: "2",
      title: "Payment processing error",
      category: "Payments",
      status: "In Progress",
      lastUpdated: "2024-01-14T15:45:00Z",
      upvotes: "12",
    },
    {
      id: "3",
      title: "Mobile app crash",
      category: "Mobile",
      status: "Resolved",
      lastUpdated: "2024-01-13T09:20:00Z",
      upvotes: "8",
    },
  ];

  const mockColumns: ColumnDef<(typeof mockData)[0]>[] = [
    {
      key: "title",
      header: "Title",
      accessor: (row) => row.title,
    },
    {
      key: "category",
      header: "Category",
      accessor: (row) => row.category,
    },
    {
      key: "status",
      header: "Status",
      accessor: (row) => row.status,
    },
    {
      key: "lastUpdated",
      header: "Last Updated",
      accessor: (row) => row.lastUpdated,
    },
    {
      key: "upvotes",
      header: "Upvotes",
      accessor: (row) => row.upvotes,
    },
  ];

  const mockActions = () => [
    {
      label: "Edit",
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: jest.fn(),
    },
    {
      label: "Delete",
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: jest.fn(),
    },
  ];

  const mockDetailPanel = (row: (typeof mockData)[0]) => (
    <div data-testid="detail-panel">
      <p>Details for: {row.title}</p>
      <p>Category: {row.category}</p>
      <p>Status: {row.status}</p>
    </div>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no data is provided", () => {
    render(<MobileSupportList data={[]} columns={mockColumns} />);

    expect(screen.getByText("No issues found")).toBeInTheDocument();
  });

  it("renders support requests with basic information", () => {
    render(<MobileSupportList data={mockData} columns={mockColumns} />);

    expect(screen.getByText("Login issue")).toBeInTheDocument();
    expect(screen.getByText("Payment processing error")).toBeInTheDocument();
    expect(screen.getByText("Mobile app crash")).toBeInTheDocument();

    expect(screen.getByText("Authentication")).toBeInTheDocument();
    expect(screen.getByText("Payments")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
  });

  it("renders upvotes information", () => {
    render(<MobileSupportList data={mockData} columns={mockColumns} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();

    const upvoteLabels = screen.getAllByText("Upvotes:");
    expect(upvoteLabels).toHaveLength(3);
  });

  it("renders actions when provided", () => {
    render(
      <MobileSupportList
        data={mockData}
        columns={mockColumns}
        actions={mockActions}
      />,
    );

    // Should have 2 action buttons per row (edit and delete)
    const actionButtons = screen.getAllByRole("button");
    expect(actionButtons).toHaveLength(6); // 2 actions × 3 rows
  });

  it("calls action onClick when action button is clicked", () => {
    const mockEditClick = jest.fn();
    const mockDeleteClick = jest.fn();

    const customActions = () => [
      {
        label: "Edit",
        icon: <PencilIcon className="w-4 h-4" />,
        onClick: mockEditClick,
      },
      {
        label: "Delete",
        icon: <TrashIcon className="w-4 h-4" />,
        onClick: mockDeleteClick,
      },
    ];

    render(
      <MobileSupportList
        data={mockData}
        columns={mockColumns}
        actions={customActions}
      />,
    );

    const editButtons = screen.getAllByTitle("Edit");
    const deleteButtons = screen.getAllByTitle("Delete");

    fireEvent.click(editButtons[0]);
    expect(mockEditClick).toHaveBeenCalledTimes(1);

    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteClick).toHaveBeenCalledTimes(1);
  });

  it("does not render actions when not provided", () => {
    render(<MobileSupportList data={mockData} columns={mockColumns} />);

    const actionButtons = screen.queryAllByRole("button");
    expect(actionButtons).toHaveLength(0);
  });

  it("renders detail panel when provided and expanded", () => {
    render(
      <MobileSupportList
        data={mockData}
        columns={mockColumns}
        detailPanel={mockDetailPanel}
      />,
    );

    // Initially, detail panels should not be visible
    expect(screen.queryByTestId("detail-panel")).not.toBeInTheDocument();

    // Click expand button to show detail panel
    const expandButtons = screen.getAllByTitle("Expand details");
    fireEvent.click(expandButtons[0]);

    // Now detail panel should be visible
    expect(screen.getByTestId("detail-panel")).toBeInTheDocument();
    expect(screen.getByText("Details for: Login issue")).toBeInTheDocument();
  });

  it("toggles detail panel expansion", () => {
    render(
      <MobileSupportList
        data={mockData}
        columns={mockColumns}
        detailPanel={mockDetailPanel}
      />,
    );

    const expandButtons = screen.getAllByTitle("Expand details");

    // Click to expand
    fireEvent.click(expandButtons[0]);
    expect(screen.getByTestId("detail-panel")).toBeInTheDocument();

    // Click to collapse
    const collapseButtons = screen.getAllByTitle("Collapse details");
    fireEvent.click(collapseButtons[0]);
    expect(screen.queryByTestId("detail-panel")).not.toBeInTheDocument();
  });

  it("handles multiple expanded rows independently", () => {
    render(
      <MobileSupportList
        data={mockData}
        columns={mockColumns}
        detailPanel={mockDetailPanel}
      />,
    );

    const expandButtons = screen.getAllByTitle("Expand details");

    // Expand first row
    fireEvent.click(expandButtons[0]);
    expect(screen.getByText("Details for: Login issue")).toBeInTheDocument();

    // Expand second row
    fireEvent.click(expandButtons[1]);
    expect(
      screen.getByText("Details for: Payment processing error"),
    ).toBeInTheDocument();

    // Both should be visible
    expect(screen.getAllByTestId("detail-panel")).toHaveLength(2);
  });

  it("uses fallback values when accessor is not provided", () => {
    const columnsWithoutAccessor: ColumnDef<(typeof mockData)[0]>[] = [
      {
        key: "title",
        header: "Title",
      },
      {
        key: "category",
        header: "Category",
      },
      {
        key: "status",
        header: "Status",
      },
      {
        key: "lastUpdated",
        header: "Last Updated",
      },
      {
        key: "upvotes",
        header: "Upvotes",
      },
    ];

    render(
      <MobileSupportList data={mockData} columns={columnsWithoutAccessor} />,
    );

    expect(screen.getByText("Login issue")).toBeInTheDocument();
    expect(screen.getByText("Authentication")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("handles rows without id by using index", () => {
    const dataWithoutId = [
      {
        title: "Issue 1",
        category: "Cat 1",
        status: "Open",
        lastUpdated: "2024-01-15T10:30:00Z",
        upvotes: "1",
      },
      {
        title: "Issue 2",
        category: "Cat 2",
        status: "Closed",
        lastUpdated: "2024-01-14T15:45:00Z",
        upvotes: "2",
      },
    ];

    render(<MobileSupportList data={dataWithoutId} columns={mockColumns} />);

    expect(screen.getByText("Issue 1")).toBeInTheDocument();
    expect(screen.getByText("Issue 2")).toBeInTheDocument();
  });

  it("handles accessor functions that return ReactNode", () => {
    const columnsWithReactNodeAccessor: ColumnDef<(typeof mockData)[0]>[] = [
      {
        key: "title",
        header: "Title",
        accessor: (row) => <span data-testid="custom-title">{row.title}</span>,
      },
      {
        key: "category",
        header: "Category",
        accessor: (row) => row.category,
      },
      {
        key: "status",
        header: "Status",
        accessor: (row) => row.status,
      },
      {
        key: "lastUpdated",
        header: "Last Updated",
        accessor: (row) => row.lastUpdated,
      },
      {
        key: "upvotes",
        header: "Upvotes",
        accessor: (row) => row.upvotes,
      },
    ];

    render(
      <MobileSupportList
        data={mockData}
        columns={columnsWithReactNodeAccessor}
      />,
    );

    const customTitleElements = screen.getAllByTestId("custom-title");
    expect(customTitleElements).toHaveLength(3);
    expect(customTitleElements[0]).toHaveTextContent("Login issue");
  });

  it("formats dates correctly", () => {
    render(<MobileSupportList data={mockData} columns={mockColumns} />);

    // Check that dates are formatted (the exact format depends on the date-fns format function)
    // We'll check that the dates are rendered in some form
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 14, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 13, 2024/)).toBeInTheDocument();
  });

  it("renders with proper structure", () => {
    render(<MobileSupportList data={mockData} columns={mockColumns} />);

    // Check that the component renders with proper structure
    expect(screen.getByText("Login issue")).toBeInTheDocument();
    expect(screen.getByText("Payment processing error")).toBeInTheDocument();
    expect(screen.getByText("Mobile app crash")).toBeInTheDocument();
  });

  it("handles empty data gracefully", () => {
    render(<MobileSupportList data={[]} columns={mockColumns} />);

    expect(screen.getByText("No issues found")).toBeInTheDocument();
  });

  it("renders expand/collapse icons correctly", () => {
    render(
      <MobileSupportList
        data={mockData}
        columns={mockColumns}
        detailPanel={mockDetailPanel}
      />,
    );

    // Initially should show expand icons
    const expandButtons = screen.getAllByTitle("Expand details");
    expect(expandButtons).toHaveLength(3);

    // Click to expand first item
    fireEvent.click(expandButtons[0]);

    // Should now show collapse icon for first item
    const collapseButtons = screen.getAllByTitle("Collapse details");
    expect(collapseButtons).toHaveLength(1);
  });
});
