import { render, screen } from "@testing-library/react";

import Spinner from "../Spinner";

describe("Spinner Component", () => {
  it("renders with default props", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("w-8 h-8"); // Default medium size
  });

  it("renders with small size", () => {
    render(<Spinner size="sm" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("w-4 h-4");
  });

  it("renders with large size", () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("w-12 h-12");
  });

  it("applies custom className", () => {
    render(<Spinner className="custom-class" />);
    const container = screen.getByRole("status").parentElement;
    expect(container).toHaveClass("custom-class");
  });

  it("has correct accessibility attributes", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveAttribute("aria-label", "loading");
  });

  it("has animation class", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("animate-spin");
  });
});
