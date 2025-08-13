import { render, screen } from "@testing-library/react";

import Table from "@/components/Table/Table";
import { ColumnDef } from "@/components/Table/types";
import CategoryTable from "../CategoryTable";

// Mock the Table component since we don't need to test its implementation
jest.mock("@/components/Table/Table", () => ({
  __esModule: true,
  default: jest.fn(({ data, columns, pageSize }) => (
    <div data-testid="mock-table">
      <div data-testid="data-length">{data.length}</div>
      <div data-testid="columns-length">{columns.length}</div>
      <div data-testid="page-size">{pageSize}</div>
      {data.map((item: { id: string; name: string }) => (
        <div key={item.id} data-testid={`row-${item.id}`}>
          {item.name}
        </div>
      ))}
    </div>
  )),
}));

describe("CategoryTable", () => {
  type Category = {
    id: string;
    name: string;
    description?: string;
    transactionCount: number;
  };

  const mockCategories: Category[] = [
    {
      id: "1",
      name: "Groceries",
      description: "Food and household items",
      transactionCount: 5,
    },
    {
      id: "2",
      name: "Transportation",
      description: "Gas and public transit",
      transactionCount: 3,
    },
  ];

  const mockColumns: ColumnDef<Category>[] = [
    {
      key: "name",
      header: "Name",
      accessor: (row) => row.name,
    },
    {
      key: "transactionCount",
      header: "Transactions",
      accessor: (row) => row.transactionCount,
    },
  ];

  const mockGetRowActions = () => [
    {
      label: "Edit",
      onClick: () => {},
    },
  ];

  const mockDetailPanel = () => <div>Details</div>;

  it("renders the table with correct props", () => {
    render(
      <CategoryTable
        categories={mockCategories}
        columns={mockColumns}
        getRowActions={mockGetRowActions}
        detailPanel={mockDetailPanel}
      />,
    );

    // Check if the mock table is rendered
    expect(screen.getByTestId("mock-table")).toBeInTheDocument();

    // Verify data is passed correctly
    expect(screen.getByTestId("data-length")).toHaveTextContent("2");
    expect(screen.getByTestId("columns-length")).toHaveTextContent("2");
    expect(screen.getByTestId("page-size")).toHaveTextContent("10");

    // Verify categories are rendered
    expect(screen.getByTestId("row-1")).toHaveTextContent("Groceries");
    expect(screen.getByTestId("row-2")).toHaveTextContent("Transportation");
  });

  it("handles empty categories array", () => {
    render(
      <CategoryTable
        categories={[]}
        columns={mockColumns}
        getRowActions={mockGetRowActions}
        detailPanel={mockDetailPanel}
      />,
    );

    expect(screen.getByTestId("data-length")).toHaveTextContent("0");
  });

  it("passes correct props to Table component", () => {
    render(
      <CategoryTable
        categories={mockCategories}
        columns={mockColumns}
        getRowActions={mockGetRowActions}
        detailPanel={mockDetailPanel}
      />,
    );

    // Check that Table was called at least once with the expected props
    const expectedProps = expect.objectContaining({
      data: mockCategories,
      columns: mockColumns,
      pageSize: 10,
      actions: expect.any(Function),
      detailPanel: expect.any(Function),
    });
    const calls = (Table as jest.Mock).mock.calls;
    expect(calls.some((call) => expectedProps.asymmetricMatch(call[0]))).toBe(
      true,
    );
  });
});
