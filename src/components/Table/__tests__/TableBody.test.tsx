import { fireEvent, render, screen } from "@testing-library/react";

import TableBody from "../TableBody";
import { ColumnDef } from "../types";

describe("TableBody Component", () => {
  const mockData = [
    { id: 1, name: "John Doe", age: 30, status: "Active" },
    { id: 2, name: "Jane Smith", age: 25, status: "Inactive" },
  ];

  const columns: ColumnDef<(typeof mockData)[0]>[] = [
    { key: "name", header: "Name" },
    { key: "age", header: "Age" },
    { key: "status", header: "Status" },
  ];

  const mockToggleRowExpansion = jest.fn();
  const mockExpandedRows = {};

  const renderWithTable = (children: React.ReactNode) => {
    return render(<table>{children}</table>);
  };

  // Add default searchQuery to all test renders
  const defaultProps = {
    data: mockData,
    columns,
    expandedRows: mockExpandedRows,
    toggleRowExpansion: mockToggleRowExpansion,
    searchQuery: "",
  };

  it("renders table rows with data", () => {
    renderWithTable(<TableBody {...defaultProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("highlights text when search query matches", () => {
    renderWithTable(<TableBody {...defaultProps} searchQuery="John" />);

    const highlightedText = screen.getByText("John");
    expect(highlightedText).toHaveClass("bg-yellow-200");

    // Non-matching text should not be highlighted
    expect(screen.getByText("Doe")).not.toHaveClass("bg-yellow-200");
  });

  it("highlights multiple matches case-insensitively", () => {
    renderWithTable(<TableBody {...defaultProps} searchQuery="active" />);

    const highlightedTexts = screen.getAllByText(/active/i, { exact: false });
    highlightedTexts.forEach((element) => {
      expect(element).toHaveClass("bg-yellow-200");
    });
  });

  it("renders empty state message when no data", () => {
    renderWithTable(<TableBody {...defaultProps} data={[]} />);

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("handles row expansion", () => {
    const detailPanel = (row: (typeof mockData)[0]) => (
      <div>Details for {row.name}</div>
    );
    const expandedRows = { "1": true };

    renderWithTable(
      <TableBody
        {...defaultProps}
        expandedRows={expandedRows}
        detailPanel={detailPanel}
      />,
    );

    const expandButtons = screen.getAllByRole("button");
    fireEvent.click(expandButtons[0]);

    expect(mockToggleRowExpansion).toHaveBeenCalledWith("1");
    expect(screen.getByText("Details for John Doe")).toBeInTheDocument();
  });

  it("renders custom accessor content without highlighting", () => {
    const columnsWithAccessor: ColumnDef<(typeof mockData)[0]>[] = [
      ...columns,
      {
        key: "custom",
        header: "Custom",
        accessor: (row) => (
          <span data-testid={`custom-${row.id}`}>Custom {row.name}</span>
        ),
      },
    ];

    renderWithTable(
      <TableBody
        {...defaultProps}
        columns={columnsWithAccessor}
        searchQuery="Custom"
      />,
    );

    // Custom accessor content should not be highlighted
    const customElements = screen.getAllByTestId(/custom-/);
    customElements.forEach((element) => {
      // Check that the element itself doesn't have the highlight class
      expect(element).not.toHaveClass("bg-yellow-200");
      // Check that none of its children have the highlight class
      expect(element.querySelector(".bg-yellow-200")).toBeNull();
    });
  });

  it("handles row actions", () => {
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();

    const actions = (row: (typeof mockData)[0]) => [
      { label: "Edit", onClick: () => mockEdit(row.id) },
      { label: "Delete", onClick: () => mockDelete(row.id) },
    ];

    renderWithTable(<TableBody {...defaultProps} actions={actions} />);

    const actionButtons = screen.getAllByRole("button");
    fireEvent.click(actionButtons[0]); // Open actions menu

    const editButton = screen.getByRole("menuitem", { name: "Edit" });
    fireEvent.click(editButton);
    expect(mockEdit).toHaveBeenCalledWith(1);

    fireEvent.click(actionButtons[0]); // Open actions menu again
    const deleteButton = screen.getByRole("menuitem", { name: "Delete" });
    fireEvent.click(deleteButton);
    expect(mockDelete).toHaveBeenCalledWith(1);
  });

  it("handles data without id field", () => {
    interface DataWithoutId extends Record<string, unknown> {
      name: string;
      age: number;
    }

    const dataWithoutId: DataWithoutId[] = [
      { name: "John Doe", age: 30 },
      { name: "Jane Smith", age: 25 },
    ];

    const columnsWithoutId: ColumnDef<DataWithoutId>[] = [
      { key: "name", header: "Name" },
      { key: "age", header: "Age" },
    ];

    renderWithTable(
      <TableBody
        {...defaultProps}
        data={dataWithoutId}
        columns={columnsWithoutId}
      />,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("handles row hover state", () => {
    renderWithTable(<TableBody {...defaultProps} />);

    const rows = screen.getAllByRole("row");
    const firstRow = rows[0];

    // Trigger hover events
    fireEvent.mouseEnter(firstRow);
    expect(firstRow).toHaveClass("bg-secondary-50");

    fireEvent.mouseLeave(firstRow);
    expect(firstRow).not.toHaveClass("bg-secondary-50");
  });

  it("handles search with highlighting across multiple columns", () => {
    const dataWithMultipleMatches = [
      { id: 1, name: "John Doe", description: "Active user", status: "Active" },
      {
        id: 2,
        name: "Jane Smith",
        description: "Inactive user",
        status: "Inactive",
      },
    ];

    const columnsWithDescription: ColumnDef<
      (typeof dataWithMultipleMatches)[0]
    >[] = [
      { key: "name", header: "Name" },
      { key: "description", header: "Description" },
      { key: "status", header: "Status" },
    ];

    renderWithTable(
      <TableBody
        {...defaultProps}
        data={dataWithMultipleMatches}
        columns={columnsWithDescription}
        searchQuery="active"
      />,
    );

    // Check that "Active" is highlighted in the status column
    const statusHighlights = screen.getAllByText("Active");
    statusHighlights.forEach((element) => {
      expect(element).toHaveClass("bg-yellow-200");
    });

    // Check that "active" is highlighted in the description column
    const descriptionHighlights = screen.getAllByText("active", {
      exact: false,
    });
    descriptionHighlights.forEach((element) => {
      expect(element).toHaveClass("bg-yellow-200");
    });

    // Check that non-matching text is not highlighted
    const nameCells = screen.getAllByText(/John Doe|Jane Smith/);
    nameCells.forEach((cell) => {
      expect(cell).not.toHaveClass("bg-yellow-200");
    });
  });
});
