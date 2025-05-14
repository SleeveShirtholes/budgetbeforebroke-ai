import { render, screen } from "@testing-library/react";

import AccountSecurity from "../AccountSecurity";

describe("AccountSecurity", () => {
  it("renders the component correctly", () => {
    render(<AccountSecurity />);

    // Check for main security features
    expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument();
    expect(screen.getByText("Change Password")).toBeInTheDocument();

    // Check for descriptions
    expect(
      screen.getByText("Add an extra layer of security to your account"),
    ).toBeInTheDocument();
    expect(screen.getByText("Last changed: 30 days ago")).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByRole("button", { name: "Enable" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
  });

  it("renders security icons", () => {
    render(<AccountSecurity />);

    // Check for icons (they are rendered as SVGs)
    const icons = document.querySelectorAll("svg");
    expect(icons).toHaveLength(2);
  });

  it("has correct styling classes", () => {
    render(<AccountSecurity />);

    // Check for main container classes
    const container = screen
      .getByRole("button", { name: "Enable" })
      .closest("div")?.parentElement;
    expect(container).toHaveClass("space-y-4");

    // Check for security feature container classes
    const securityContainers = document.querySelectorAll(".bg-secondary-50");
    expect(securityContainers).toHaveLength(2);
  });
});
