import { fireEvent, render, screen } from "@testing-library/react";

import { TransactionCategory } from "@/types/transaction";
import SpendingChart from "../SpendingChart";

// Mock the MonthlySpendingChart component since it's a child component
jest.mock("@/components/MonthlySpendingChart", () => {
  return function MockMonthlySpendingChart() {
    return <div data-testid="monthly-spending-chart" />;
  };
});

describe("SpendingChart", () => {
  const mockChartData = {
    data: [
      { month: "Jan", amount: 1000 },
      { month: "Feb", amount: 1500 },
    ],
    datasets: [
      {
        label: "Spending",
        data: [1000, 1500],
        borderColor: "#000",
        backgroundColor: "#fff",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#000",
        pointBorderColor: "#fff",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const defaultProps = {
    chartData: mockChartData,
    chartViewMode: "total" as const,
    selectedCategories: new Set<TransactionCategory>(),
    onChartViewModeChange: jest.fn(),
  };

  it("renders the component with default props", () => {
    render(<SpendingChart {...defaultProps} />);

    expect(screen.getByText("Daily Spending")).toBeInTheDocument();
    expect(screen.getByTestId("monthly-spending-chart")).toBeInTheDocument();
  });

  it("displays correct title for single selected category", () => {
    const props = {
      ...defaultProps,
      selectedCategories: new Set<TransactionCategory>(["Food"]),
    };

    render(<SpendingChart {...props} />);

    expect(screen.getByText("Food Spending")).toBeInTheDocument();
  });

  it("displays correct title for multiple selected categories", () => {
    const props = {
      ...defaultProps,
      selectedCategories: new Set<TransactionCategory>([
        "Food",
        "Transportation",
      ]),
    };

    render(<SpendingChart {...props} />);

    expect(
      screen.getByText("Selected Categories Spending"),
    ).toBeInTheDocument();
  });

  it("renders view mode selector with all options", () => {
    render(<SpendingChart {...defaultProps} />);

    const select = screen.getByPlaceholderText("Total Spending");
    expect(select).toBeInTheDocument();

    // Click the select to open the dropdown
    fireEvent.click(select);

    // Check if all options are present
    expect(screen.getByText("Total Spending")).toBeInTheDocument();
    expect(screen.getByText("By Category")).toBeInTheDocument();
    expect(screen.getByText("Income vs Expenses")).toBeInTheDocument();
  });

  it("calls onChartViewModeChange when view mode is changed", () => {
    render(<SpendingChart {...defaultProps} />);

    const select = screen.getByPlaceholderText("Total Spending");
    fireEvent.click(select);

    const option = screen.getByText("By Category");
    fireEvent.click(option);

    expect(defaultProps.onChartViewModeChange).toHaveBeenCalledWith(
      "byCategory",
    );
  });

  it("renders with correct container classes", () => {
    const { container } = render(<SpendingChart {...defaultProps} />);

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass(
      "bg-white",
      "rounded-xl",
      "shadow",
      "p-6",
      "border",
      "border-secondary-100",
    );
  });

  it("renders chart container with correct height", () => {
    render(<SpendingChart {...defaultProps} />);

    const chartContainer = screen.getByTestId(
      "monthly-spending-chart",
    ).parentElement;
    expect(chartContainer).toHaveClass("h-[400px]");
  });
});
