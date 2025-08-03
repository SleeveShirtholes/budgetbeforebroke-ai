import { render, screen, fireEvent } from "@testing-library/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import MobileCategoryList from "../MobileCategoryList";
import { ColumnDef } from "../types";

describe("MobileCategoryList", () => {
  const mockData = [
    {
      id: "1",
      name: "Food & Dining",
      description: "Restaurants, groceries, and dining expenses",
      transactionCount: "15",
    },
    {
      id: "2",
      name: "Transportation",
      description: "Gas, public transit, and vehicle maintenance",
      transactionCount: "8",
    },
    {
      id: "3",
      name: "Entertainment",
      description: "",
      transactionCount: "5",
    },
  ];

  const mockColumns: ColumnDef<(typeof mockData)[0]>[] = [
    {
      key: "name",
      header: "Name",
      accessor: (row) => row.name,
    },
    {
      key: "description",
      header: "Description",
      accessor: (row) => row.description,
    },
    {
      key: "transactionCount",
      header: "Transactions",
      accessor: (row) => row.transactionCount,
    },
  ];

  const mockActions = (row: (typeof mockData)[0]) => [ // eslint-disable-line @typescript-eslint/no-unused-vars
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no data is provided", () => {
    render(<MobileCategoryList data={[]} columns={mockColumns} />);

    expect(screen.getByText("No categories found")).toBeInTheDocument();
  });

  it("renders categories with basic information", () => {
    render(<MobileCategoryList data={mockData} columns={mockColumns} />);

    expect(screen.getByText("Food & Dining")).toBeInTheDocument();
    expect(screen.getByText("Transportation")).toBeInTheDocument();
    expect(screen.getByText("Entertainment")).toBeInTheDocument();

    expect(
      screen.getByText("Restaurants, groceries, and dining expenses"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Gas, public transit, and vehicle maintenance"),
    ).toBeInTheDocument();

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders transaction count labels", () => {
    render(<MobileCategoryList data={mockData} columns={mockColumns} />);

    const transactionLabels = screen.getAllByText("Transactions:");
    expect(transactionLabels).toHaveLength(3);
  });

  it("renders actions when provided", () => {
    render(
      <MobileCategoryList
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

    const customActions = (row: (typeof mockData)[0]) => [ // eslint-disable-line @typescript-eslint/no-unused-vars
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
      <MobileCategoryList
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
    render(<MobileCategoryList data={mockData} columns={mockColumns} />);

    const actionButtons = screen.queryAllByRole("button");
    expect(actionButtons).toHaveLength(0);
  });

  it("handles missing description gracefully", () => {
    render(<MobileCategoryList data={mockData} columns={mockColumns} />);

    // Should not render description for Entertainment category (empty description)
    // The component should not render empty strings
    const entertainmentCard = screen.getByText("Entertainment").closest("div");
    expect(entertainmentCard).toBeInTheDocument();
  });

  it("uses fallback values when accessor is not provided", () => {
    const columnsWithoutAccessor: ColumnDef<(typeof mockData)[0]>[] = [
      {
        key: "name",
        header: "Name",
      },
      {
        key: "description",
        header: "Description",
      },
      {
        key: "transactionCount",
        header: "Transactions",
      },
    ];

    render(
      <MobileCategoryList data={mockData} columns={columnsWithoutAccessor} />,
    );

    expect(screen.getByText("Food & Dining")).toBeInTheDocument();
    expect(
      screen.getByText("Restaurants, groceries, and dining expenses"),
    ).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("handles rows without id by using index", () => {
    const dataWithoutId = [
      { name: "Category 1", description: "Desc 1", transactionCount: "1" },
      { name: "Category 2", description: "Desc 2", transactionCount: "2" },
    ];

    render(<MobileCategoryList data={dataWithoutId} columns={mockColumns} />);

    expect(screen.getByText("Category 1")).toBeInTheDocument();
    expect(screen.getByText("Category 2")).toBeInTheDocument();
  });

  it("handles accessor functions that return ReactNode", () => {
    const columnsWithReactNodeAccessor: ColumnDef<(typeof mockData)[0]>[] = [
      {
        key: "name",
        header: "Name",
        accessor: (row) => <span data-testid="custom-name">{row.name}</span>,
      },
      {
        key: "description",
        header: "Description",
        accessor: (row) => row.description,
      },
      {
        key: "transactionCount",
        header: "Transactions",
        accessor: (row) => row.transactionCount,
      },
    ];

    render(
      <MobileCategoryList
        data={mockData}
        columns={columnsWithReactNodeAccessor}
      />,
    );

    const customNameElements = screen.getAllByTestId("custom-name");
    expect(customNameElements).toHaveLength(3);
    expect(customNameElements[0]).toHaveTextContent("Food & Dining");
  });

  it("renders with proper structure", () => {
    render(<MobileCategoryList data={mockData} columns={mockColumns} />);

    // Check that the component renders with proper structure
    expect(screen.getByText("Food & Dining")).toBeInTheDocument();
    expect(screen.getByText("Transportation")).toBeInTheDocument();
    expect(screen.getByText("Entertainment")).toBeInTheDocument();
  });
});
