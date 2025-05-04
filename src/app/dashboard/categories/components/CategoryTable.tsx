import { ColumnDef } from "@/components/Table/types";
import React from "react";
/**
 * CategoryTable Component
 *
 * Renders a table of categories using the shared Table component. Accepts columns, row actions, and a detail panel renderer.
 * Memoized for performance. Used in the CategoriesPage to display and manage category data.
 *
 * Props:
 * - categories: Array of category objects to display
 * - columns: Table column definitions
 * - getRowActions: Function to generate row actions for each row
 * - detailPanel: Function to render the detail panel for a row
 */
import Table from "@/components/Table/Table";

// Category type for table rows
interface Category extends Record<string, unknown> {
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

// Props for CategoryTable
interface CategoryTableProps {
  categories: Category[];
  columns: ColumnDef<Category>[];
  getRowActions: (row: Category) => RowAction[];
  detailPanel: (row: Category) => React.ReactNode;
}

/**
 * CategoryTable renders the main categories table with actions and expandable detail panels.
 */
const CategoryTable: React.FC<CategoryTableProps> = React.memo(
  ({ categories, columns, getRowActions, detailPanel }) => {
    return (
      <Table
        data={categories as Record<string, unknown>[]}
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
CategoryTable.displayName = "CategoryTable";

export default CategoryTable;
