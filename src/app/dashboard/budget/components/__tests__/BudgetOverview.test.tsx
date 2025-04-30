import { render, screen } from "@testing-library/react";

import { BudgetOverview } from "../BudgetOverview";

describe("BudgetOverview", () => {
    it("renders all three cards with correct values", () => {
        render(<BudgetOverview totalBudget={2000} totalBudgeted={1500} remainingBudget={500} />);

        // Check total budget card
        expect(screen.getByText("Total Budget")).toBeInTheDocument();
        expect(screen.getByText("$2,000.00")).toBeInTheDocument();

        // Check budgeted amount card
        expect(screen.getByText("Budgeted Amount")).toBeInTheDocument();
        expect(screen.getByText("$1,500.00")).toBeInTheDocument();

        // Check remaining budget card
        expect(screen.getByText("Remaining to Budget")).toBeInTheDocument();
        expect(screen.getByText("$500.00")).toBeInTheDocument();
    });

    it("shows positive remaining budget in green", () => {
        render(<BudgetOverview totalBudget={2000} totalBudgeted={1500} remainingBudget={500} />);
        const remainingText = screen.getByText("$500.00");
        expect(remainingText).toHaveClass("text-green-600");
    });

    it("shows negative remaining budget in red", () => {
        render(<BudgetOverview totalBudget={2000} totalBudgeted={2500} remainingBudget={-500} />);
        const remainingText = screen.getByText("$500.00");
        expect(remainingText).toHaveClass("text-red-600");
    });

    it("renders correct icons", () => {
        render(<BudgetOverview totalBudget={2000} totalBudgeted={1500} remainingBudget={500} />);
        const icons = screen.getAllByTestId("icon");
        expect(icons).toHaveLength(3);
        icons.forEach((icon) => {
            expect(icon).toHaveAttribute("aria-hidden", "true");
        });
    });
});
