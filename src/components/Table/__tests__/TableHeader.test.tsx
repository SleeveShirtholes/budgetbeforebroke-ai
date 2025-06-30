import { fireEvent, render, screen } from "@testing-library/react";
import { ColumnDef, FiltersState, SortDirection, SortingState } from "../types";

import TableHeader from "../TableHeader";

describe("TableHeader Component", () => {
  const columns: ColumnDef<unknown>[] = [
    { key: "select", header: "", sortable: false },
    { key: "name", header: "Name", sortable: true, filterable: true },
    { key: "age", header: "Age", sortable: true },
    { key: "status", header: "Status", sortable: false },
  ];

  const initialSorting: SortingState = {
    column: "",
    direction: "asc",
  };

  const initialFilters: FiltersState = {};

  const mockOnSort = jest.fn();
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnSort.mockClear();
    mockOnFilterChange.mockClear();
  });

  const renderWithTable = (children: React.ReactNode) => {
    return render(<table>{children}</table>);
  };

  it("renders column headers", () => {
    renderWithTable(
      <TableHeader
        columns={columns}
        sorting={initialSorting}
        filters={initialFilters}
        onSort={mockOnSort}
        onFilterChange={mockOnFilterChange}
        actions={false}
        hasDetailPanel={false}
      />,
    );

    columns.forEach((column) => {
      if (column.header) {
        expect(screen.getByText(column.header)).toBeInTheDocument();
      }
    });
  });

  it("shows expansion column when hasDetailPanel is true", () => {
    renderWithTable(
      <TableHeader
        columns={columns}
        sorting={initialSorting}
        filters={initialFilters}
        onSort={mockOnSort}
        onFilterChange={mockOnFilterChange}
        actions={false}
        hasDetailPanel={true}
      />,
    );

    // Check that the expansion column is present (it's an empty th element)
    const headerCells = screen.getAllByRole("columnheader");
    expect(headerCells).toHaveLength(columns.length + 1); // +1 for expansion column
  });

  it("hides expansion column when hasDetailPanel is false", () => {
    renderWithTable(
      <TableHeader
        columns={columns}
        sorting={initialSorting}
        filters={initialFilters}
        onSort={mockOnSort}
        onFilterChange={mockOnFilterChange}
        actions={false}
        hasDetailPanel={false}
      />,
    );

    // Check that the expansion column is not present
    const headerCells = screen.getAllByRole("columnheader");
    expect(headerCells).toHaveLength(columns.length); // No expansion column
  });

  it("handles sorting when clicking sortable columns", () => {
    // Initial render with no sorting
    const { rerender } = renderWithTable(
      <TableHeader
        columns={columns}
        sorting={initialSorting}
        filters={initialFilters}
        onSort={mockOnSort}
        onFilterChange={mockOnFilterChange}
        actions={false}
        hasDetailPanel={false}
      />,
    );

    // Find the Name column header by its text content within a cursor-pointer element
    const nameColumnHeader = screen
      .getAllByText("Name")
      .find((el) => el.closest(".cursor-pointer"));

    if (!nameColumnHeader) {
      throw new Error("Could not find sortable Name column header");
    }

    // First click - should set ascending sort
    fireEvent.click(nameColumnHeader);
    expect(mockOnSort).toHaveBeenCalledWith({
      column: "name",
      direction: "asc" as SortDirection,
    });

    // Re-render with ascending sort
    rerender(
      <table>
        <TableHeader
          columns={columns}
          sorting={{ column: "name", direction: "asc" }}
          filters={initialFilters}
          onSort={mockOnSort}
          onFilterChange={mockOnFilterChange}
          actions={false}
          hasDetailPanel={false}
        />
      </table>,
    );

    // Second click - should set descending sort
    fireEvent.click(nameColumnHeader);
    expect(mockOnSort).toHaveBeenCalledWith({
      column: "name",
      direction: "desc" as SortDirection,
    });

    // Re-render with descending sort
    rerender(
      <table>
        <TableHeader
          columns={columns}
          sorting={{ column: "name", direction: "desc" }}
          filters={initialFilters}
          onSort={mockOnSort}
          onFilterChange={mockOnFilterChange}
          actions={false}
          hasDetailPanel={false}
        />
      </table>,
    );

    // Third click - should clear sorting
    fireEvent.click(nameColumnHeader);
    expect(mockOnSort).toHaveBeenCalledWith({
      column: "",
      direction: "asc" as SortDirection,
    });
  });

  it("shows filter button for filterable columns", () => {
    renderWithTable(
      <TableHeader
        columns={columns}
        sorting={initialSorting}
        filters={initialFilters}
        onSort={mockOnSort}
        onFilterChange={mockOnFilterChange}
        actions={false}
        hasDetailPanel={false}
      />,
    );

    const filterButton = screen.getByTitle("Filter column");
    expect(filterButton).toBeInTheDocument();
  });

  it("applies correct sorting indicator", () => {
    renderWithTable(
      <TableHeader
        columns={columns}
        sorting={{ column: "name", direction: "asc" }}
        filters={initialFilters}
        onSort={mockOnSort}
        onFilterChange={mockOnFilterChange}
        actions={false}
        hasDetailPanel={false}
      />,
    );

    // Find the sort icon by finding the SVG within the Name column's cursor-pointer div
    const nameColumn = screen.getByText("Name").closest(".cursor-pointer");
    const sortIcon = nameColumn?.querySelector("svg");
    expect(sortIcon).toHaveClass("text-gray-600");
  });
});
