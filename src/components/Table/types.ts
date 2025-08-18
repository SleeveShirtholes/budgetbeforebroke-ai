import { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export interface SortingState {
  column: string;
  direction: SortDirection;
}

export interface FilterValue {
  value: string;
  operator: FilterOperator;
}

export type FilterOperator =
  | "contains"
  | "equals"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan"
  | "between";

export interface FiltersState {
  [columnKey: string]: FilterValue;
}

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (row: T) => ReactNode;
  cell?: ({ getValue }: { getValue: () => unknown }) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  filterPlaceholder?: string;
}
