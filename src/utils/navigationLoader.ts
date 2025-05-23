import { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  description: string;
}

export interface NavDropdown {
  label: string;
  items: NavItem[];
}

export interface NavItemWithReactIcon {
  label: string;
  href: string;
  icon: ReactNode;
  description: string;
}

export interface NavDropdownWithReactIcon {
  label: string;
  items: NavItemWithReactIcon[];
}

export type NavigationData = Record<string, NavDropdown>;
export type NavigationWithReactIcons = Record<string, NavDropdownWithReactIcon>;

// We'll load the navigation data on the server side and pass it to the client
// This is a placeholder for demonstration purposes
export const navigationData: NavigationData = {
  transactions: {
    label: "Transactions",
    items: [
      {
        label: "All Transactions",
        href: "/dashboard/transactions",
        icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
        description: "View your complete transaction history",
      },
      {
        label: "Add Transaction",
        href: "/dashboard/transactions/new",
        icon: "M12 4v16m8-8H4",
        description: "Record a new expense or income",
      },
      {
        label: "Recurring",
        href: "/dashboard/transactions/recurring",
        icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
        description: "Manage your recurring transactions",
      },
    ],
  },
  budgets: {
    label: "Budgets",
    items: [
      {
        label: "Overview",
        href: "/dashboard/budgets",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        description: "See all your budget allocations",
      },
      {
        label: "Categories",
        href: "/dashboard/budgets/categories",
        icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
        description: "Manage your spending categories",
      },
      {
        label: "Set Goals",
        href: "/dashboard/budgets/goals",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        description: "Create and track saving goals",
      },
    ],
  },
  reports: {
    label: "Reports",
    items: [
      {
        label: "Analytics",
        href: "/dashboard/reports/analytics",
        icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
        description: "Get a better understanding of your traffic",
      },
      {
        label: "Spending Insights",
        href: "/dashboard/reports/insights",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        description: "Speak directly to your customers",
      },
    ],
  },
};
