import { render, screen } from "@testing-library/react";

import { format } from "date-fns";
import KeyMetrics from "../KeyMetrics";

describe("KeyMetrics", () => {
  const mockProps = {
    totalIncome: 5000,
    totalExpenses: 3000,
    netSavings: 2000,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
  };

  it("renders all three metric cards", () => {
    render(<KeyMetrics {...mockProps} />);

    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    expect(screen.getByText("Net Savings")).toBeInTheDocument();
  });

  it("displays formatted values correctly", () => {
    render(<KeyMetrics {...mockProps} />);

    expect(screen.getByText("$5,000")).toBeInTheDocument();
    expect(screen.getByText("$3,000")).toBeInTheDocument();
    expect(screen.getByText("$2,000")).toBeInTheDocument();
  });

  it("shows correct date range", () => {
    render(<KeyMetrics {...mockProps} />);

    const dateRange = `${format(mockProps.startDate, "MMM d")} - ${format(mockProps.endDate, "MMM d")}`;
    const dateElements = screen.getAllByText(dateRange);

    // Date range should appear twice (for income and expenses)
    expect(dateElements).toHaveLength(2);
  });

  it("displays positive trend for positive net savings", () => {
    render(<KeyMetrics {...mockProps} />);

    expect(screen.getByText("Positive")).toBeInTheDocument();
  });

  it("displays negative trend for negative net savings", () => {
    const negativeProps = {
      ...mockProps,
      totalIncome: 3000,
      totalExpenses: 5000,
      netSavings: -2000,
    };

    render(<KeyMetrics {...negativeProps} />);

    expect(screen.getByText("Negative")).toBeInTheDocument();
  });

  it("renders with correct grid layout classes", () => {
    const { container } = render(<KeyMetrics {...mockProps} />);

    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass(
      "grid",
      "grid-cols-1",
      "md:grid-cols-3",
      "gap-6",
    );
  });
});
