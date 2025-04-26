# Table Component

A flexible and reusable Table component with powerful features including sorting, searching, pagination, expandable rows, and action menus.

## Features

- ✅ Passing in data and columns for flexible table generation
- ✅ Sortable columns with customizable sort behavior
- ✅ Global search functionality across all columns
- ✅ Per-column filtering with multiple operators (contains, equals, starts/ends with, greater/less than)
- ✅ Pagination with dynamic page size (with built-in toggle switch)
- ✅ Expandable rows with custom detail panels
- ✅ Row hover highlighting
- ✅ Action dropdown menu for each row
- ✅ Support for custom cell rendering

## Usage

```tsx
import Table, { ColumnDef } from '@/components/Table';

// Define your data type
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Sample data
const data: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  // ...more data
];

// Define columns
const columns: ColumnDef<User>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    filterable: true,
    filterPlaceholder: 'Search names...'
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    filterable: true,
  },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    filterable: true,
    // Custom formatter for this column
    accessor: (row) => (
      <span className={row.role === 'Admin' ? 'text-primary-600' : 'text-secondary-600'}>
        {row.role}
      </span>
    ),
  },
];

// Detail panel component (optional)
const detailPanel = (row: User) => (
  <div className="p-4">
    <h3 className="font-semibold">{row.name}</h3>
    <p>Additional details about the user...</p>
  </div>
);

// Row actions (optional)
const getRowActions = (row: User) => [
  {
    label: 'Edit',
    icon: <EditIcon />,
    onClick: () => handleEdit(row.id),
  },
  {
    label: 'Delete',
    icon: <DeleteIcon />,
    onClick: () => handleDelete(row.id),
  },
];

// Then in your component:
function UserList() {
  // Optional: track pagination state in your component
  const [showPagination, setShowPagination] = useState(true);
  
  return (
    <Table
      data={data}
      columns={columns}
      detailPanel={detailPanel}
      actions={getRowActions}
      pageSize={10}
      showPagination={showPagination}
      onPaginationChange={setShowPagination} // Optional: respond to pagination toggle
    />
  );
}
```

## Column Filtering

Each column with `filterable: true` displays a filter icon in the header. When clicked, it opens a dropdown with:

1. **Operator selector** - Choose from:
   - Contains (default)
   - Equals
   - Starts with
   - Ends with
   - Greater than
   - Less than

2. **Filter value** - Text input to enter the value to filter by

Active filters appear below the search bar, showing which columns are being filtered and the applied criteria.

## API Reference

### Table Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `T[]` | Yes | The array of data to display in the table |
| `columns` | `ColumnDef<T>[]` | Yes | Configuration for table columns |
| `detailPanel` | `(row: T) => ReactNode` | No | Function to render expanded row details |
| `actions` | `(row: T) => Action[]` | No | Function to return row actions |
| `className` | `string` | No | Custom CSS classes for the table |
| `pageSize` | `number` | No | Number of rows per page (default: 10) |
| `showPagination` | `boolean` | No | Whether to enable pagination (default: true) |
| `onPaginationChange` | `(showPagination: boolean) => void` | No | Callback when pagination is toggled via the UI control |

### ColumnDef

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `key` | `string` | Yes | The property key in your data object |
| `header` | `string` | Yes | Column header label |
| `accessor` | `(row: T) => ReactNode` | No | Custom renderer for the cell content |
| `sortable` | `boolean` | No | Whether the column is sortable (default: false) |
| `filterable` | `boolean` | No | Whether the column is filterable (default: false) |
| `filterPlaceholder` | `string` | No | Placeholder text for the filter input |
| `width` | `string` | No | CSS width for the column |

### Action

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | The text shown in the action menu |
| `icon` | `ReactNode` | No | Icon to show next to the label |
| `onClick` | `() => void` | Yes | Function called when the action is clicked |

### Filter Options

The following filter operators are available for column filtering:

- **Contains**: Matches if the cell value contains the filter value (default)
- **Equals**: Matches if the cell value exactly equals the filter value
- **Starts with**: Matches if the cell value starts with the filter value
- **Ends with**: Matches if the cell value ends with the filter value
- **Greater than**: Matches if the cell value is greater than the filter value (for numeric values)
- **Less than**: Matches if the cell value is less than the filter value (for numeric values) 
