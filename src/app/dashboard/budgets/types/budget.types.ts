export const BUDGET_CATEGORIES = [
  "Housing",
  "Transportation",
  "Food & Groceries",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Debt Payments",
  "Savings",
  "Personal Care",
  "Entertainment",
  "Shopping",
  "Education",
  "Gifts & Donations",
  "Pets",
  "Miscellaneous",
] as const;

export type BudgetCategoryName = (typeof BUDGET_CATEGORIES)[number];

export interface BudgetCategory {
  id: string;
  name: BudgetCategoryName;
  amount: number;
  color: string;
}

export const CATEGORY_COLORS: Record<BudgetCategoryName, string> = {
  Housing: "#4F46E5",
  Transportation: "#0EA5E9",
  "Food & Groceries": "#10B981",
  Utilities: "#F59E0B",
  Insurance: "#6366F1",
  Healthcare: "#EC4899",
  "Debt Payments": "#EF4444",
  Savings: "#14B8A6",
  "Personal Care": "#8B5CF6",
  Entertainment: "#F43F5E",
  Shopping: "#FB923C",
  Education: "#22D3EE",
  "Gifts & Donations": "#A855F7",
  Pets: "#84CC16",
  Miscellaneous: "#64748B",
};

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  amount: number;
  month: Date;
  categoryId: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewCategory {
  categoryId: string;
  amount: string;
}

export interface FormErrors {
  [key: string]: string;
}
