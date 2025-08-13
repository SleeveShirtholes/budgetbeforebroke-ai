import { render, screen } from "@testing-library/react";

import AccountLayout from "../layout";

// Mock the child components
jest.mock("@/components/Breadcrumb", () => {
  return function MockBreadcrumb() {
    return <div data-testid="mock-breadcrumb">Breadcrumb</div>;
  };
});

jest.mock("@/components/Header", () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>;
  };
});

describe("AccountLayout", () => {
  it("renders the layout with header and breadcrumb", () => {
    render(
      <AccountLayout>
        <div>Test Child Content</div>
      </AccountLayout>,
    );

    // Check if Header is rendered
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();

    // Check if Breadcrumb is rendered
    expect(screen.getByTestId("mock-breadcrumb")).toBeInTheDocument();

    // Check if child content is rendered
    expect(screen.getByText("Test Child Content")).toBeInTheDocument();
  });

  it("applies correct layout classes", () => {
    render(
      <AccountLayout>
        <div>Test Child Content</div>
      </AccountLayout>,
    );

    // Check main container classes
    const mainContainer = screen.getByRole("main");
    expect(mainContainer).toHaveClass("max-w-7xl", "mx-auto", "py-8", "pt-22");

    // Check content wrapper classes
    const contentWrappers = document.querySelectorAll(
      ".px-4.sm\\:px-6.lg\\:px-8",
    );
    expect(contentWrappers).toHaveLength(2); // One for breadcrumb, one for children
  });
});
