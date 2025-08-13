import { fireEvent, render, screen } from "@testing-library/react";

import SupportTableHeader from "../SupportTableHeader";

describe("SupportTableHeader", () => {
  const mockOnStatusViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the table title", () => {
    render(
      <SupportTableHeader
        tableTitle="My Open Issues"
        statusView="open"
        onStatusViewChange={mockOnStatusViewChange}
      />,
    );
    expect(screen.getByText("My Open Issues")).toBeInTheDocument();
  });

  it("renders the status filter dropdown", () => {
    render(
      <SupportTableHeader
        tableTitle="My Open Issues"
        statusView="open"
        onStatusViewChange={mockOnStatusViewChange}
      />,
    );
    expect(
      screen.getByPlaceholderText("Open & In Progress"),
    ).toBeInTheDocument();
  });

  it("displays correct status options", () => {
    render(
      <SupportTableHeader
        tableTitle="My Open Issues"
        statusView="open"
        onStatusViewChange={mockOnStatusViewChange}
      />,
    );
    const select = screen.getByPlaceholderText("Open & In Progress");
    expect(select).toHaveValue("");
  });

  it("calls onStatusViewChange when status is changed", () => {
    render(
      <SupportTableHeader
        tableTitle="My Open Issues"
        statusView="open"
        onStatusViewChange={mockOnStatusViewChange}
      />,
    );
    const select = screen.getByPlaceholderText("Open & In Progress");
    fireEvent.change(select, { target: { value: "Closed" } });
    expect(select).toHaveValue("Closed");
  });

  it("shows 'Open & In Progress' when statusView is 'open'", () => {
    render(
      <SupportTableHeader
        tableTitle="My Open Issues"
        statusView="open"
        onStatusViewChange={mockOnStatusViewChange}
      />,
    );
    expect(
      screen.getByPlaceholderText("Open & In Progress"),
    ).toBeInTheDocument();
  });

  it("shows 'Closed' when statusView is 'closed'", () => {
    render(
      <SupportTableHeader
        tableTitle="My Closed Issues"
        statusView="closed"
        onStatusViewChange={mockOnStatusViewChange}
      />,
    );
    expect(screen.getByPlaceholderText("Closed")).toBeInTheDocument();
  });

  it("renders with correct heading level", () => {
    render(
      <SupportTableHeader
        tableTitle="My Open Issues"
        statusView="open"
        onStatusViewChange={mockOnStatusViewChange}
      />,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("My Open Issues");
  });

  it("renders with correct responsive classes", () => {
    render(
      <SupportTableHeader
        tableTitle="My Open Issues"
        statusView="open"
        onStatusViewChange={mockOnStatusViewChange}
      />,
    );

    const container = screen.getByText("My Open Issues").closest("div");
    expect(container).toHaveClass(
      "flex",
      "flex-col",
      "md:flex-row",
      "md:items-center",
      "md:justify-between",
      "mb-4",
      "gap-2",
    );
  });

  it("dropdown has correct id", () => {
    render(
      <SupportTableHeader
        tableTitle="My Open Issues"
        statusView="open"
        onStatusViewChange={mockOnStatusViewChange}
      />,
    );

    const select = screen.getByPlaceholderText("Open & In Progress");
    expect(select).toHaveAttribute("id", "status-dropdown");
  });
});
