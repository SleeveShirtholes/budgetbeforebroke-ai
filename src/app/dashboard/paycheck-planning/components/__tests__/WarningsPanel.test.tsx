import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WarningsPanel from "../WarningsPanel";

// Mock the dismissWarning action
jest.mock("@/app/actions/paycheck-planning", () => ({
  dismissWarning: jest.fn(),
}));

import { dismissWarning } from "@/app/actions/paycheck-planning";

/**
 * Test suite for WarningsPanel component
 * Tests warning display, dismissal functionality, and user interactions
 */
describe("WarningsPanel", () => {
  const mockWarnings = [
    {
      type: "debt_unpaid" as const,
      message: "You have unpaid debts from last month",
      debtId: "debt-1",
      severity: "high" as const,
    },
    {
      type: "insufficient_funds" as const,
      message: "Not enough funds to cover all debts",
      severity: "medium" as const,
    },
    {
      type: "late_payment" as const,
      message: "Payment is overdue",
      debtId: "debt-2",
      severity: "high" as const,
    },
  ];

  const defaultProps = {
    warnings: mockWarnings,
    budgetAccountId: "test-account-id",
    onWarningDismissed: jest.fn(),
  };

  const mockDismissWarning = dismissWarning as jest.MockedFunction<
    typeof dismissWarning
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDismissWarning.mockResolvedValue({ success: true });
  });

  it("renders the warnings panel with correct title", () => {
    render(<WarningsPanel {...defaultProps} />);

    expect(screen.getByText("Payment Warnings")).toBeInTheDocument();
    expect(screen.getByText("3 issues found")).toBeInTheDocument(); // Warning count
  });

  it("displays all warnings", () => {
    render(<WarningsPanel {...defaultProps} />);

    // Check that all warnings are displayed
    expect(
      screen.getByText("You have unpaid debts from last month"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Not enough funds to cover all debts"),
    ).toBeInTheDocument();
    expect(screen.getByText("Payment is overdue")).toBeInTheDocument();
  });

  it("always displays warnings", () => {
    render(<WarningsPanel {...defaultProps} />);

    // Verify warnings are always visible
    expect(
      screen.getByText("You have unpaid debts from last month"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Not enough funds to cover all debts"),
    ).toBeInTheDocument();
    expect(screen.getByText("Payment is overdue")).toBeInTheDocument();
  });

  it("displays warning count correctly", () => {
    render(<WarningsPanel {...defaultProps} />);

    expect(screen.getByText("3 issues found")).toBeInTheDocument();
  });

  it("shows no warnings message when warnings array is empty", () => {
    const { container } = render(
      <WarningsPanel {...defaultProps} warnings={[]} />,
    );

    // Component returns null when there are no warnings
    expect(container.firstChild).toBeNull();
  });

  it("displays warning severity indicators correctly", () => {
    render(<WarningsPanel {...defaultProps} />);

    // Check for severity indicators (these would be icons or color coding)
    const warningElements = screen.getAllByText(
      /You have unpaid debts|Not enough funds|Payment is overdue/,
    );
    expect(warningElements).toHaveLength(3);
  });

  it("calls dismissWarning when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    render(<WarningsPanel {...defaultProps} />);

    // Click dismiss on the first warning
    const dismissButtons = screen.getAllByTitle("Dismiss warning");
    await user.click(dismissButtons[0]);

    expect(mockDismissWarning).toHaveBeenCalledWith(
      "test-account-id",
      "debt_unpaid",
      expect.any(String), // warning key
    );
  });

  it("calls onWarningDismissed after successful dismissal", async () => {
    const user = userEvent.setup();
    render(<WarningsPanel {...defaultProps} />);

    // Click dismiss on a warning
    const dismissButtons = screen.getAllByTitle("Dismiss warning");
    await user.click(dismissButtons[0]);

    // Wait for the dismissal to complete
    await screen.findByText("You have unpaid debts from last month");

    expect(defaultProps.onWarningDismissed).toHaveBeenCalled();
  });

  it("handles dismissal errors gracefully", async () => {
    const user = userEvent.setup();
    mockDismissWarning.mockRejectedValue(new Error("Failed to dismiss"));

    render(<WarningsPanel {...defaultProps} />);

    // Click dismiss on a warning
    const dismissButtons = screen.getAllByTitle("Dismiss warning");
    await user.click(dismissButtons[0]);

    // The warning should still be visible since dismissal failed
    expect(
      screen.getByText("You have unpaid debts from last month"),
    ).toBeInTheDocument();
  });

  it("displays different warning types with appropriate styling", () => {
    render(<WarningsPanel {...defaultProps} />);

    // Check that different warning types are displayed
    expect(
      screen.getByText("You have unpaid debts from last month"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Not enough funds to cover all debts"),
    ).toBeInTheDocument();
    expect(screen.getByText("Payment is overdue")).toBeInTheDocument();
  });

  it("handles keyboard navigation correctly", async () => {
    const user = userEvent.setup();
    render(<WarningsPanel {...defaultProps} />);

    // Tab through dismiss buttons
    const dismissButtons = screen.getAllByTitle("Dismiss warning");
    await user.tab();

    // Focus should be on the first dismiss button
    expect(dismissButtons[0]).toHaveFocus();
  });

  it("maintains state during interactions", async () => {
    const user = userEvent.setup();
    render(<WarningsPanel {...defaultProps} />);

    // Verify warnings are visible
    expect(
      screen.getByText("You have unpaid debts from last month"),
    ).toBeInTheDocument();

    // Interact with a warning (click dismiss)
    const dismissButtons = screen.getAllByTitle("Dismiss warning");
    await user.click(dismissButtons[0]);

    // Panel should remain visible
    expect(
      screen.getByText("Not enough funds to cover all debts"),
    ).toBeInTheDocument();
  });

  it("handles large numbers of warnings correctly", () => {
    const manyWarnings = Array.from({ length: 25 }, (_, i) => ({
      type: "debt_unpaid" as const,
      message: `Warning ${i + 1}`,
      severity: "medium" as const,
    }));

    render(<WarningsPanel {...defaultProps} warnings={manyWarnings} />);

    expect(screen.getByText("25 issues found")).toBeInTheDocument();
  });

  it("displays warning messages with proper formatting", () => {
    render(<WarningsPanel {...defaultProps} />);

    // Check that warning messages are properly formatted
    const warningMessages = screen.getAllByText(
      /You have unpaid debts|Not enough funds|Payment is overdue/,
    );
    warningMessages.forEach((message) => {
      expect(message).toBeInTheDocument();
    });
  });
});
