import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import Navigation from "../Navigation";

describe("Navigation Component", () => {
  it("renders the logo text", () => {
    render(<Navigation />);
    expect(screen.getByText("BudgetBeforeBroke")).toBeInTheDocument();
  });

  it("renders sign in and sign up buttons", () => {
    render(<Navigation />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("has correct link destinations", () => {
    render(<Navigation />);
    expect(screen.getByText("Sign In").closest("a")).toHaveAttribute(
      "href",
      "/auth/signin",
    );
    expect(screen.getByText("Sign Up").closest("a")).toHaveAttribute(
      "href",
      "/auth/signup",
    );
  });
});
