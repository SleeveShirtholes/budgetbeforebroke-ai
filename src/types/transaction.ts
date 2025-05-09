export type TransactionCategory =
  | "Housing"
  | "Transportation"
  | "Food"
  | "Utilities"
  | "Insurance"
  | "Healthcare"
  | "Savings"
  | "Personal"
  | "Entertainment"
  | "Debt"
  | "Income"
  | "Other";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant: string;
  merchantLocation: string;
  amount: number;
  type: "expense" | "income";
  category: TransactionCategory;
  notes?: string;
  account?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Savings",
  "Personal",
  "Entertainment",
  "Debt",
  "Income",
  "Other",
];

export const getCategoryColor = (category: TransactionCategory): string => {
  const colors: Record<TransactionCategory, string> = {
    Housing: "#4F46E5", // Indigo
    Transportation: "#0EA5E9", // Sky
    Food: "#10B981", // Emerald
    Utilities: "#F59E0B", // Amber
    Insurance: "#6366F1", // Indigo
    Healthcare: "#EC4899", // Pink
    Savings: "#14B8A6", // Teal
    Personal: "#8B5CF6", // Violet
    Entertainment: "#F43F5E", // Rose
    Debt: "#EF4444", // Red
    Income: "#22C55E", // Green
    Other: "#64748B", // Slate
  };
  return colors[category];
};
