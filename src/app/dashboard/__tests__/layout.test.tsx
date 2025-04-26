import { render, screen } from "@testing-library/react";

import DashboardLayout from "../layout";

// Mock the Header component
jest.mock("@/components/Header", () => {
  return function MockHeader({ userName }: { userName: string }) {
    return <header data-testid="header">Header for {userName}</header>;
  };
});

// Mock the Breadcrumb component
jest.mock("@/components/Breadcrumb", () => {
  return function MockBreadcrumb() {
    return <nav data-testid="breadcrumb">Breadcrumb Navigation</nav>;
  };
});

describe("Dashboard Layout", () => {
  it("renders with correct structure and components", () => {
    const testContent = "Test Content";
    const { container } = render(
      <DashboardLayout>
        <div>{testContent}</div>
      </DashboardLayout>,
    );

    // Check for the main container with background
    expect(container.firstChild).toHaveClass("min-h-screen", "bg-secondary-50");

    // Check for header with correct user
    const header = screen.getByTestId("header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent("Header for John Doe");

    // Check for main content area with correct classes
    const main = screen.getByRole("main");
    expect(main).toHaveClass("max-w-7xl", "mx-auto", "px-4", "py-8", "pt-6");

    // Check for breadcrumb
    expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Breadcrumb Navigation")).toBeInTheDocument();

    // Check for children content
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });
});
