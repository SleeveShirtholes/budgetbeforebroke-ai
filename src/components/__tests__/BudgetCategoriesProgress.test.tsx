import { render, screen } from "@testing-library/react";

import BudgetCategoriesProgress from "../BudgetCategoriesProgress";

describe("BudgetCategoriesProgress", () => {
  const mockCategories = [
    {
      name: "Food",
      spent: 300,
      budget: 500,
      color: "#FF0000",
    },
    {
      name: "Entertainment",
      spent: 150,
      budget: 200,
      color: "#00FF00",
    },
    {
      name: "Transport",
      spent: 250,
      budget: 200,
      color: "#0000FF",
    },
  ];

  it("renders all categories", () => {
    render(<BudgetCategoriesProgress categories={mockCategories} />);

    expect(screen.getByText("Budget Categories")).toBeInTheDocument();
    mockCategories.forEach((category) => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });

  it("displays correct spending amounts and budgets", () => {
    render(<BudgetCategoriesProgress categories={mockCategories} />);

    mockCategories.forEach((category) => {
      expect(
        screen.getByText(
          `$${category.spent.toFixed(2)} / $${category.budget.toFixed(2)}`,
        ),
      ).toBeInTheDocument();
    });
  });

  it("calculates and displays correct percentages and remaining amounts", () => {
    render(<BudgetCategoriesProgress categories={mockCategories} />);

    // Food: 60% spent, $200 remaining
    expect(screen.getByText("60.0% spent")).toBeInTheDocument();
    expect(screen.getByText("$200.00 remaining")).toBeInTheDocument();

    // Entertainment: 75% spent, $50 remaining
    expect(screen.getByText("75.0% spent")).toBeInTheDocument();
    expect(screen.getByText("$50.00 remaining")).toBeInTheDocument();

    // Transport: 100% spent (capped), $0 remaining
    expect(screen.getByText("100.0% spent")).toBeInTheDocument();
    expect(screen.getByText("$0.00 remaining")).toBeInTheDocument();
  });

  it("applies correct styles and colors to progress bars", () => {
    const { container } = render(
      <BudgetCategoriesProgress categories={mockCategories} />,
    );

    const progressBars = container.querySelectorAll(
      ".absolute.h-full.rounded-full",
    );
    progressBars.forEach((bar, index) => {
      const isOverspent =
        mockCategories[index].spent > mockCategories[index].budget;
      expect(bar).toHaveStyle({
        backgroundColor: isOverspent ? "#EF4444" : "var(--color-primary-500)",
        width: `${Math.min((mockCategories[index].spent / mockCategories[index].budget) * 100, 100)}%`,
      });
    });
  });

  it("handles empty categories array", () => {
    render(<BudgetCategoriesProgress categories={[]} />);

    expect(screen.getByText("Budget Categories")).toBeInTheDocument();
    expect(screen.queryByText("spent")).not.toBeInTheDocument();
  });
});
