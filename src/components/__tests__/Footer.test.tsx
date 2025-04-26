import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import Footer from "../Footer";

describe("Footer Component", () => {
  it("renders the copyright text with current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(
        `© ${currentYear} BudgetBeforeBroke. All rights reserved.`,
      ),
    ).toBeInTheDocument();
  });

  it("renders all footer links", () => {
    render(<Footer />);
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Terms")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("has correct link destinations", () => {
    render(<Footer />);
    expect(screen.getByText("Privacy").closest("a")).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByText("Terms").closest("a")).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(screen.getByText("Contact").closest("a")).toHaveAttribute(
      "href",
      "/contact",
    );
  });
});
