import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import DashboardLayout from "../layout";

// Mock the Header component
jest.mock("@/components/Header", () => {
  return function MockHeader() {
    return <header data-testid="header">Header for John Doe</header>;
  };
});

// Mock the Breadcrumb component
jest.mock("@/components/Breadcrumb", () => {
  return function MockBreadcrumb() {
    return <nav data-testid="breadcrumb">Breadcrumb Navigation</nav>;
  };
});

// Mock the AccountSelector component
jest.mock("@/components/AccountSelector", () => {
  return function MockAccountSelector() {
    return <div data-testid="account-selector">Account Selector</div>;
  };
});

// Mock the budgetAccountStore
jest.mock("@/stores/budgetAccountStore", () => ({
  useBudgetAccount: () => ({
    selectedAccount: {
      id: "test-account-id",
      accountNumber: "TEST-1234",
      nickname: "Test Account",
      users: [],
      invitations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    accounts: [],
    isLoading: false,
    error: null,
    setSelectedAccount: jest.fn(),
    setAccounts: jest.fn(),
    setIsLoading: jest.fn(),
    setError: jest.fn(),
  }),
}));

describe("Dashboard Layout", () => {
  it("renders with correct structure and components", () => {
    const testContent = "Test Content";
    render(
      <DashboardLayout>
        <div>{testContent}</div>
      </DashboardLayout>,
    );

    // Check for the main container with background
    const mainContainer = document.querySelector(".min-h-screen");
    expect(mainContainer).toBeInTheDocument();

    // Check for header with correct user
    const header = screen.getByTestId("header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent("Header for John Doe");

    // Check for main content area with correct classes
    const main = screen.getByRole("main");
    expect(main).toHaveClass(
      "max-w-7xl",
      "mx-auto",
      "px-4",
      "sm:px-6",
      "lg:px-8",
      "py-6",
      "sm:py-8",
      "pt-20",
      "sm:pt-22",
    );

    // Check for the flex container with breadcrumb and account selector
    const flexContainer = main.firstChild;
    expect(flexContainer).toHaveClass(
      "mb-6",
      "flex",
      "flex-col",
      "sm:flex-row",
      "sm:items-center",
      "sm:justify-between",
      "gap-4",
    );

    // Check for breadcrumb
    expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Breadcrumb Navigation")).toBeInTheDocument();

    // Check for account selector
    expect(screen.getByTestId("account-selector")).toBeInTheDocument();
    expect(screen.getByText("Account Selector")).toBeInTheDocument();

    // Check for children content
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });
});
