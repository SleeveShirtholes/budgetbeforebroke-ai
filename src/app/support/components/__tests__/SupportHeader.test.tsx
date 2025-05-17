import { render, screen } from "@testing-library/react";

import SupportHeader from "../SupportHeader";

describe("SupportHeader", () => {
  it("renders the support center title", () => {
    render(<SupportHeader />);
    expect(screen.getByText("Support Center")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<SupportHeader />);
    expect(
      screen.getByText("Track your support requests or create a new one."),
    ).toBeInTheDocument();
  });

  it("renders with correct heading level", () => {
    render(<SupportHeader />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Support Center");
  });
});
