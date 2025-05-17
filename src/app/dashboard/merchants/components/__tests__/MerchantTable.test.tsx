import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ColumnDef } from "@/components/Table/types";
import MerchantTable from "../MerchantTable";

// Define the Merchant interface to match the component
interface Merchant extends Record<string, unknown> {
  id: string;
  name: string;
  description?: string;
  transactionCount: number;
}

describe("MerchantTable", () => {
  const mockMerchants: Merchant[] = [
    {
      id: "1",
      name: "Test Merchant 1",
      description: "Test Description 1",
      transactionCount: 5,
    },
    {
      id: "2",
      name: "Test Merchant 2",
      description: "Test Description 2",
      transactionCount: 10,
    },
  ];

  const mockColumns: ColumnDef<Merchant>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      filterable: true,
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      filterable: true,
    },
    {
      key: "transactionCount",
      header: "Transactions",
      sortable: true,
      filterable: true,
    },
  ];

  const mockGetRowActions = () => [
    {
      label: "Edit",
      onClick: () => {},
    },
    {
      label: "Delete",
      onClick: () => {},
    },
  ];

  const mockDetailPanel = (row: Merchant) => (
    <div>Detail Panel for {row.name}</div>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders table with merchants", () => {
    render(
      <MerchantTable
        merchants={mockMerchants}
        columns={mockColumns}
        getRowActions={mockGetRowActions}
        detailPanel={mockDetailPanel}
      />,
    );

    expect(screen.getByText("Test Merchant 1")).toBeInTheDocument();
    expect(screen.getByText("Test Description 1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Test Merchant 2")).toBeInTheDocument();
    expect(screen.getByText("Test Description 2")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders empty state when no merchants", () => {
    render(
      <MerchantTable
        merchants={[]}
        columns={mockColumns}
        getRowActions={mockGetRowActions}
        detailPanel={mockDetailPanel}
      />,
    );

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders table with correct columns", () => {
    render(
      <MerchantTable
        merchants={mockMerchants}
        columns={mockColumns}
        getRowActions={mockGetRowActions}
        detailPanel={mockDetailPanel}
      />,
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("renders detail panel when row is expanded", async () => {
    render(
      <MerchantTable
        merchants={mockMerchants}
        columns={mockColumns}
        getRowActions={mockGetRowActions}
        detailPanel={mockDetailPanel}
      />,
    );

    // The row itself is clickable for expansion, not a button.
    // Find the cell containing the merchant name and click it.
    const merchantCell = screen.getByText("Test Merchant 1");
    fireEvent.click(merchantCell);

    // Wait for the detail panel to be rendered
    await waitFor(() => {
      expect(
        screen.getByText("Detail Panel for Test Merchant 1"),
      ).toBeInTheDocument();
    });
  });
});
