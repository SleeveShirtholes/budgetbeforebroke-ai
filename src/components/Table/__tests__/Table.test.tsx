import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import Table from "../Table";
import { ColumnDef } from "../types";

// Mock data interface
interface TestData extends Record<string, unknown> {
  id: number;
  name: string;
  age: number;
  status: string;
}

// Sample test data
const mockData: TestData[] = [
  { id: 1, name: "John Doe", age: 30, status: "Active" },
  { id: 2, name: "Jane Smith", age: 25, status: "Inactive" },
  { id: 3, name: "Bob Johnson", age: 35, status: "Active" },
];

// Sample column definitions
const columns: ColumnDef<TestData>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    filterable: true,
  },
  {
    key: "age",
    header: "Age",
    sortable: true,
    filterable: true,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    filterable: true,
    accessor: (row) => (
      <span data-testid={`status-${row.id}`}>{row.status}</span>
    ),
  },
];

describe("Table Component", () => {
  it("renders table with data", () => {
    render(<Table data={mockData} columns={columns} />);

    // Check if all column headers are present
    columns.forEach((column) => {
      expect(screen.getByText(column.header)).toBeInTheDocument();
    });

    // Check if all data rows are present
    mockData.forEach((row) => {
      expect(screen.getByText(row.name)).toBeInTheDocument();
      expect(screen.getByText(row.age.toString())).toBeInTheDocument();
      expect(screen.getByTestId(`status-${row.id}`)).toBeInTheDocument();
    });
  });

  it("shows expansion column when detailPanel is provided", () => {
    const detailPanel = (row: TestData) => (
      <div data-testid={`detail-${row.id}`}>Detail for {row.name}</div>
    );

    render(
      <Table data={mockData} columns={columns} detailPanel={detailPanel} />,
    );

    // Check that the expansion column is present in the header
    const headerCells = screen.getAllByRole("columnheader");
    expect(headerCells).toHaveLength(columns.length + 1); // +1 for expansion column
  });

  it("hides expansion column when detailPanel is not provided", () => {
    render(<Table data={mockData} columns={columns} />);

    // Check that the expansion column is not present in the header
    const headerCells = screen.getAllByRole("columnheader");
    expect(headerCells).toHaveLength(columns.length); // No expansion column
  });

  it("handles detail panel expansion", () => {
    const detailPanel = (row: TestData) => (
      <div data-testid={`detail-${row.id}`}>Detail for {row.name}</div>
    );

    render(
      <Table data={mockData} columns={columns} detailPanel={detailPanel} />,
    );

    // Initially, no detail panels should be visible
    expect(screen.queryByTestId("detail-1")).not.toBeInTheDocument();

    // Click on the first row to expand it
    const firstRow = screen.getByText("John Doe").closest("tr");
    if (!firstRow) {
      throw new Error("Could not find first row");
    }
    fireEvent.click(firstRow);

    // Detail panel should now be visible
    expect(screen.getByTestId("detail-1")).toBeInTheDocument();
    expect(screen.getByText("Detail for John Doe")).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(firstRow);
    expect(screen.queryByTestId("detail-1")).not.toBeInTheDocument();
  });

  it("handles basic filtering", async () => {
    render(<Table data={mockData} columns={columns} />);

    // Open name filter
    const filterButtons = screen.getAllByTitle("Filter column");
    fireEvent.click(filterButtons[0]);

    // Enter filter value
    const filterInput = screen.getByPlaceholderText("Filter...");
    fireEvent.change(filterInput, { target: { value: "John" } });

    // Apply filter
    const applyButton = screen.getByText("Apply");
    fireEvent.click(applyButton);

    // Wait for filter to be applied
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });

  it("handles empty data state", () => {
    render(<Table data={[]} columns={columns} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  describe("Row count display", () => {
    it("shows correct row count with pagination enabled", () => {
      render(<Table data={mockData} columns={columns} pageSize={2} />);
      expect(screen.getByText("Showing 2 of 3 rows")).toBeInTheDocument();
    });

    it("shows all rows when pagination is disabled", () => {
      render(
        <Table data={mockData} columns={columns} showPagination={false} />,
      );
      expect(screen.getByText("Showing 3 of 3 rows")).toBeInTheDocument();
    });

    it("updates row count when filtering is applied", async () => {
      render(<Table data={mockData} columns={columns} />);

      // Open status filter
      const filterButtons = screen.getAllByTitle("Filter column");
      fireEvent.click(filterButtons[2]); // Status column

      // Enter filter value
      const filterInput = screen.getByPlaceholderText("Filter...");
      fireEvent.change(filterInput, { target: { value: "Active" } });

      // Apply filter
      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      // Wait for filter to be applied and check row count
      await waitFor(() => {
        expect(screen.getByText("Showing 2 of 2 rows")).toBeInTheDocument();
      });
    });

    it("updates row count when search is applied", async () => {
      render(<Table data={mockData} columns={columns} />);

      // Enter search term
      const searchInput = screen.getByPlaceholderText("Search...");
      fireEvent.change(searchInput, { target: { value: "John" } });

      // Wait for and check if the filtered data is displayed
      await waitFor(() => {
        // Both rows containing "John" should be present
        const rows = screen.getAllByRole("row");
        // First row is header, so we expect 3 rows total (header + 2 data rows)
        expect(rows).toHaveLength(3);

        // Check that both rows containing "John" are present
        const cells = screen.getAllByRole("cell");
        const nameCells = cells.filter((cell) =>
          cell.textContent?.includes("John"),
        );
        expect(nameCells).toHaveLength(2);
        expect(nameCells[0].textContent).toContain("John Doe");
        expect(nameCells[1].textContent).toContain("Bob Johnson");

        // Jane Smith should not be present
        expect(
          screen.queryByText(
            (content, element) =>
              element?.textContent?.includes("Jane Smith") ?? false,
          ),
        ).not.toBeInTheDocument();
      });
    });
  });

  it("has proper horizontal scrolling container", () => {
    render(<Table data={mockData} columns={columns} />);

    // Find the table wrapper with overflow-x-auto
    const tableWrapper = screen.getByRole("table").closest(".overflow-x-auto");
    expect(tableWrapper).toBeInTheDocument();

    // Verify the table is properly contained within the scrolling container
    const table = screen.getByRole("table");
    expect(tableWrapper).toContainElement(table);

    // Verify the table has the correct width constraints
    expect(table).toHaveClass("w-full");
  });

  it("renders custom cell content when cell property is provided", () => {
    const customColumns: ColumnDef<TestData>[] = [
      {
        key: "name",
        header: "Name",
        cell: ({ getValue }) => (
          <span data-testid="custom-cell">{getValue()}</span>
        ),
      },
      {
        key: "age",
        header: "Age",
        sortable: true,
      },
    ];

    render(<Table data={mockData} columns={customColumns} />);

    // Check that custom cell content is rendered
    const customCells = screen.getAllByTestId("custom-cell");
    expect(customCells).toHaveLength(mockData.length);
    expect(customCells[0]).toHaveTextContent("John Doe");
  });
});
