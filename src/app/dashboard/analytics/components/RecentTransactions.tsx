"use client";

import Card from "@/components/Card";
import Table from "@/components/Table/Table";
import { ColumnDef } from "@/components/Table/types";
import { TransactionWithCategory } from "@/app/actions/transaction";
import { format } from "date-fns";
import Spinner from "@/components/Spinner";

/**
 * Props for the RecentTransactions component
 */
interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
  isLoading?: boolean;
}

/**
 * RecentTransactions Component
 *
 * A feature-rich table component that displays recent financial transactions with the following capabilities:
 * - Sortable columns for date, merchant, amount, and category
 * - Filterable data for each column
 * - Pagination with 10 items per page
 * - Color-coded amounts (green for income, red for expenses)
 * - Formatted dates and currency values
 * - Empty state handling when no transactions are available
 *
 * The component uses our custom Table component which provides advanced features like:
 * - Column sorting
 * - Data filtering
 * - Pagination
 * - Responsive design
 *
 * @param {RecentTransactionsProps} props - Component props
 * @param {Transaction[]} props.transactions - Array of transactions to display
 * @returns {JSX.Element} A table displaying recent transactions with interactive features
 */
export default function RecentTransactions({
  transactions,
  isLoading,
}: RecentTransactionsProps) {
  // Define table columns with their configuration
  const columns: ColumnDef<TransactionWithCategory>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      filterable: true,
      // Format date to "MMM d, yyyy" format (e.g., "Jan 1, 2024")
      accessor: (row: TransactionWithCategory) =>
        format(new Date(row.date), "MMM d, yyyy"),
    },
    {
      key: "merchantName",
      header: "Merchant",
      sortable: true,
      filterable: true,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      filterable: true,
      // Custom renderer for amount with color coding and formatting
      accessor: (row: TransactionWithCategory) => (
        <span
          className={row.type === "income" ? "text-green-600" : "text-red-600"}
        >
          {row.type === "income" ? "+" : "-"}$
          {row.amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "categoryName",
      header: "Category",
      sortable: true,
      filterable: true,
      accessor: (row: TransactionWithCategory) =>
        row.categoryName || "Uncategorized",
    },
  ];

  return (
    <Card variant="default" padding="md">
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : transactions.length === 0 ? (
        // Show message when no transactions are available
        <p className="text-gray-500 text-center py-4">No transactions found</p>
      ) : (
        // Render table with pagination and all features enabled
        <Table
          data={transactions}
          columns={columns}
          pageSize={10}
          showPagination={true}
        />
      )}
    </Card>
  );
}
