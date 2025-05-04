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
});
