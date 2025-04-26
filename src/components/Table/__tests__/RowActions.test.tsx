import { act, fireEvent, render, screen } from "@testing-library/react";

import RowActions from "../RowActions";

describe("RowActions Component", () => {
  const mockActions = [
    { label: "Edit", onClick: jest.fn() },
    { label: "Delete", onClick: jest.fn() },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders nothing when no actions are provided", () => {
    render(<RowActions actions={[]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders actions button and handles click", () => {
    render(<RowActions actions={mockActions} />);

    // Check if button is rendered
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    // Click button to open menu
    fireEvent.click(button);

    // Check if menu items are rendered
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Delete" }),
    ).toBeInTheDocument();
  });

  it("handles action clicks", () => {
    render(<RowActions actions={mockActions} />);

    // Open menu
    fireEvent.click(screen.getByRole("button"));

    // Click Edit action
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(mockActions[0].onClick).toHaveBeenCalled();

    // Menu should be closed after action
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it("handles click outside to close menu", () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <RowActions actions={mockActions} />
      </div>,
    );

    // Open menu
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();

    // Click outside
    act(() => {
      fireEvent.mouseDown(screen.getByTestId("outside"));
    });

    // Menu should be closed
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it("renders actions with icons", () => {
    const actionsWithIcons = [
      {
        label: "Edit",
        icon: <svg data-testid="edit-icon" />,
        onClick: jest.fn(),
      },
    ];

    render(<RowActions actions={actionsWithIcons} />);

    // Open menu
    fireEvent.click(screen.getByRole("button"));

    // Check if icon is rendered
    expect(screen.getByTestId("edit-icon")).toBeInTheDocument();
  });

  it("toggles menu visibility on button clicks", () => {
    render(<RowActions actions={mockActions} />);
    const button = screen.getByRole("button");

    // Open menu
    fireEvent.click(button);
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();

    // Close menu
    fireEvent.click(button);
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });
});
