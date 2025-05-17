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
});
