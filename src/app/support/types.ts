import { SelectOption } from "@/components/Forms/CustomSelect";

// Define category values for type derivation first
const categoryLiterals = [
  "Feature Request",
  "Issue",
  "General Question",
] as const;
export type SupportCategory = (typeof categoryLiterals)[number];

// Then define the options for the select component
export const supportCategoriesOptions: SelectOption[] = categoryLiterals.map(
  (cat) => ({
    value: cat,
    label: cat,
  }),
);

// Define the type for a support request
export interface Comment {
  id: string;
  user: string; // For simplicity, user is a string. Could be an object later.
  text: string;
  timestamp: string;
}

// Define the type for the status of a support request
const statusLiterals = ["Open", "In Progress", "Closed"] as const;
export type SupportStatus = (typeof statusLiterals)[number];

// Then define the options for the status select component
export const supportStatusOptions: SelectOption[] = statusLiterals.map(
  (status) => ({
    value: status,
    label: status,
  }),
);

// Add a mock current user
export const currentUser = "John Doe";

// Define the type for a support request
export interface SupportRequest {
  id: string;
  title: string;
  description: string;
  category: SupportCategory;
  status: SupportStatus;
  lastUpdated: string;
  isPublic: boolean;
  comments: Comment[];
  upvotes: number;
  downvotes: number;
  user: string; // Add user field
}

// Define a type for the table that satisfies Record<string, unknown>
export interface TableSupportRequest extends SupportRequest {
  [key: string]: unknown; // Index signature for table compatibility
}

// Define the type for new request form data (without status since it's always "Open")
export interface NewRequestFormData {
  title: string;
  description: string;
  category: SupportCategory;
  isPublic: boolean;
}
