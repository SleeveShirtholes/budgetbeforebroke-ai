import { ColumnDef } from "@/components/Table/types";
import React from "react";
/**
 * MerchantTable Component
 *
 * Renders a table of merchants using the shared Table component. Accepts columns, row actions, and a detail panel renderer.
 * Memoized for performance. Used in the MerchantsPage to display and manage merchant data.
 *
 * Props:
 * - merchants: Array of merchant objects to display
 * - columns: Table column definitions
 * - getRowActions: Function to generate row actions for each row
 * - detailPanel: Function to render the detail panel for a row
 */
import Table from "@/components/Table/Table";

// Merchant type for table rows
interface Merchant extends Record<string, unknown> {
  id: string;
  name: string;
  description?: string;
  transactionCount: number;
}

// Row action type for table actions
interface RowAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

// Props for MerchantTable
interface MerchantTableProps {
  merchants: Merchant[];
  columns: ColumnDef<Merchant>[];
  getRowActions: (row: Merchant) => RowAction[];
  detailPanel: (row: Merchant) => React.ReactNode;
}

/**
 * MerchantTable renders the main merchants table with actions and expandable detail panels.
 */
const MerchantTable: React.FC<MerchantTableProps> = React.memo(
  ({ merchants, columns, getRowActions, detailPanel }) => {
    return (
      <Table
        data={merchants as Record<string, unknown>[]}
        columns={columns as ColumnDef<Record<string, unknown>>[]}
        actions={getRowActions as (row: Record<string, unknown>) => RowAction[]}
        pageSize={10}
        detailPanel={
          detailPanel as (row: Record<string, unknown>) => React.ReactNode
        }
      />
    );
  },
);
MerchantTable.displayName = "MerchantTable";

export default MerchantTable;
