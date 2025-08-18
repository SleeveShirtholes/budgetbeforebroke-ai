/**
 * Types for admin panel components
 */

export interface TableSchema {
  tableName: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: unknown;
  }>;
  editableFields: string[];
  searchFields: string[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
