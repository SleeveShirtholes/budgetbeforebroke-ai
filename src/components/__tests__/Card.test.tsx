import { render, screen } from "@testing-library/react";

import Card from "../Card";

describe("Card Component", () => {
  // Test default rendering
  it("renders with default props", () => {
    const { container } = render(<Card>Test Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(card).toHaveClass(
      "rounded-xl",
      "shadow",
      "bg-white",
      "border",
      "border-secondary-100",
      "p-6",
    );
  });

  // Test different variants
  it("renders with outline variant", () => {
    const { container } = render(<Card variant="outline">Outline Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(screen.getByText("Outline Card")).toBeInTheDocument();
    expect(card).toHaveClass(
      "bg-transparent",
      "border",
      "border-secondary-200",
    );
  });

  it("renders with filled variant", () => {
    const { container } = render(<Card variant="filled">Filled Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(screen.getByText("Filled Card")).toBeInTheDocument();
    expect(card).toHaveClass(
      "bg-secondary-50",
      "border",
      "border-secondary-100",
    );
  });

  // Test different padding options
  it("renders with no padding", () => {
    const { container } = render(<Card padding="none">No Padding</Card>);
    const card = container.firstChild as HTMLElement;
    expect(screen.getByText("No Padding")).toBeInTheDocument();
    expect(card).not.toHaveClass("p-4", "p-6", "p-8");
  });

  it("renders with small padding", () => {
    const { container } = render(<Card padding="sm">Small Padding</Card>);
    const card = container.firstChild as HTMLElement;
    expect(screen.getByText("Small Padding")).toBeInTheDocument();
    expect(card).toHaveClass("p-4");
  });

  it("renders with large padding", () => {
    const { container } = render(<Card padding="lg">Large Padding</Card>);
    const card = container.firstChild as HTMLElement;
    expect(screen.getByText("Large Padding")).toBeInTheDocument();
    expect(card).toHaveClass("p-8");
  });

  // Test custom className
  it("applies custom className", () => {
    const { container } = render(
      <Card className="custom-class">Custom Class</Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(screen.getByText("Custom Class")).toBeInTheDocument();
    expect(card).toHaveClass("custom-class");
  });

  // Test with complex children
  it("renders with complex children", () => {
    render(
      <Card>
        <div>
          <h1>Title</h1>
          <p>Content</p>
        </div>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
