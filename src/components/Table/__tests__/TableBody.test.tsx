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

  it("renders table rows with data", () => {
    renderWithTable(
      <TableBody
        data={mockData}
        columns={columns}
        expandedRows={mockExpandedRows}
        toggleRowExpansion={mockToggleRowExpansion}
      />,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("renders empty state message when no data", () => {
    renderWithTable(
      <TableBody
        data={[]}
        columns={columns}
        expandedRows={mockExpandedRows}
        toggleRowExpansion={mockToggleRowExpansion}
      />,
    );

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("handles row expansion", () => {
    const detailPanel = (row: (typeof mockData)[0]) => (
      <div>Details for {row.name}</div>
    );
    const expandedRows = { "1": true };

    renderWithTable(
      <TableBody
        data={mockData}
        columns={columns}
        expandedRows={expandedRows}
        toggleRowExpansion={mockToggleRowExpansion}
        detailPanel={detailPanel}
      />,
    );

    const expandButtons = screen.getAllByRole("button");
    fireEvent.click(expandButtons[0]);

    expect(mockToggleRowExpansion).toHaveBeenCalledWith("1");
    expect(screen.getByText("Details for John Doe")).toBeInTheDocument();
  });

  it("renders custom accessor content", () => {
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
        data={mockData}
        columns={columnsWithAccessor}
        expandedRows={mockExpandedRows}
        toggleRowExpansion={mockToggleRowExpansion}
      />,
    );

    expect(screen.getByTestId("custom-1")).toHaveTextContent("Custom John Doe");
    expect(screen.getByTestId("custom-2")).toHaveTextContent(
      "Custom Jane Smith",
    );
  });

  it("handles row actions", () => {
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();

    const actions = (row: (typeof mockData)[0]) => [
      { label: "Edit", onClick: () => mockEdit(row.id) },
      { label: "Delete", onClick: () => mockDelete(row.id) },
    ];

    renderWithTable(
      <TableBody
        data={mockData}
        columns={columns}
        expandedRows={mockExpandedRows}
        toggleRowExpansion={mockToggleRowExpansion}
        actions={actions}
      />,
    );

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
        data={dataWithoutId}
        columns={columnsWithoutId}
        expandedRows={mockExpandedRows}
        toggleRowExpansion={mockToggleRowExpansion}
      />,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("handles row hover state", () => {
    renderWithTable(
      <TableBody
        data={mockData}
        columns={columns}
        expandedRows={mockExpandedRows}
        toggleRowExpansion={mockToggleRowExpansion}
      />,
    );

    const rows = screen.getAllByRole("row");
    const firstRow = rows[0];

    // Trigger hover events
    fireEvent.mouseEnter(firstRow);
    expect(firstRow).toHaveClass("bg-secondary-50");

    fireEvent.mouseLeave(firstRow);
    expect(firstRow).not.toHaveClass("bg-secondary-50");
  });
});
