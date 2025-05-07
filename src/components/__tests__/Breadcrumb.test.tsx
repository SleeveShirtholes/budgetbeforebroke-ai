import { render, screen } from "@testing-library/react";

import Breadcrumb from "../Breadcrumb";
import { usePathname } from "next/navigation";

// Mock the next/navigation usePathname hook
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Breadcrumb", () => {
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    mockUsePathname.mockReset();
  });

  it("renders dashboard breadcrumb correctly", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Breadcrumb />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("renders nested path breadcrumbs correctly", () => {
    mockUsePathname.mockReturnValue("/dashboard/budget/categories");
    render(<Breadcrumb />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
  });

  it("handles paths with hyphens and underscores", () => {
    mockUsePathname.mockReturnValue("/dashboard/my-budget/expense_tracking");
    render(<Breadcrumb />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("My Budget")).toBeInTheDocument();
    expect(screen.getByText("Expense Tracking")).toBeInTheDocument();
  });

  it("renders correct number of separators", () => {
    mockUsePathname.mockReturnValue("/dashboard/budget/categories");
    const { container } = render(<Breadcrumb />);

    // There should be 2 separators for 3 breadcrumb items
    const separators = container.querySelectorAll("svg");
    expect(separators).toHaveLength(2);
  });

  it("applies correct styles to last breadcrumb item", () => {
    mockUsePathname.mockReturnValue("/dashboard/budget");
    render(<Breadcrumb />);

    const dashboardLink = screen.getByText("Dashboard");
    const budgetLink = screen.getByText("Budget");

    expect(dashboardLink).toHaveClass("text-primary-500");
    expect(budgetLink).toHaveClass("text-secondary-500");
  });

  it("renders 'Home' as root for non-dashboard routes", () => {
    mockUsePathname.mockReturnValue("/account");
    render(<Breadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});
