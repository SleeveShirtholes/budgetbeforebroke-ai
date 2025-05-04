import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import Hero from "../Hero";

describe("Hero Component", () => {
  it("renders the main heading", () => {
    render(<Hero />);
    expect(screen.getByText("Budget first,")).toBeInTheDocument();
    expect(
      screen.getByText("less oops and more cha-ching"),
    ).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<Hero />);
    expect(
      screen.getByText(
        /Take control of your finances with intuitive budgeting tools\. Create budgets, track spending, and manage debt with our easy-to-use platform\./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders the call to action button", () => {
    render(<Hero />);
    const button = screen.getByText("Get Started Free");
    expect(button).toBeInTheDocument();
    expect(button.closest("a")).toHaveAttribute("href", "/signup");
  });
});
