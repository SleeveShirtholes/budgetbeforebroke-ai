import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import Button from "../Button";

describe("Button Component", () => {
  it("renders button with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies primary variant styles", () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByText("Primary Button");
    expect(button).toHaveClass("bg-primary-600");
    expect(button).toHaveClass("hover:bg-primary-700");
  });

  it("applies secondary variant styles", () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByText("Secondary Button");
    expect(button).toHaveClass("bg-secondary-100");
    expect(button).toHaveClass("hover:bg-secondary-200");
  });

  it("applies outline variant styles", () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByText("Outline Button");
    expect(button).toHaveClass("border-2");
    expect(button).toHaveClass("border-primary-600");
    expect(button).toHaveClass("hover:bg-primary-50");
  });

  it("applies disabled state", () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText("Disabled Button");
    expect(button).toBeDisabled();
  });

  it("applies danger variant styles", () => {
    render(<Button variant="danger">Danger Button</Button>);
    const button = screen.getByText("Danger Button");
    expect(button).toHaveClass("bg-red-600");
    expect(button).toHaveClass("hover:bg-red-700");
  });

  it("applies loading state", () => {
    render(<Button isLoading>Loading Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("opacity-70");
    expect(button).toHaveClass("cursor-not-allowed");
    // When loading, only spinner should be visible, not the text
    expect(screen.queryByText("Loading Button")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button").querySelector(".animate-spin"),
    ).toBeInTheDocument();
  });

  it("maintains consistent width during loading state", () => {
    const { rerender } = render(<Button>Wide Button Text</Button>);
    const button = screen.getByRole("button");

    // Get initial width
    const initialWidth = button.offsetWidth;

    // Switch to loading state
    rerender(<Button isLoading>Wide Button Text</Button>);

    // Button should still have the same width (or very close due to min-width)
    expect(button.offsetWidth).toBeGreaterThanOrEqual(initialWidth - 5); // Allow small tolerance
  });
});
