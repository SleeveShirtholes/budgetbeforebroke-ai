import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import Features from "../Features";

describe("Features Component", () => {
    it("renders all feature cards", () => {
        render(<Features />);
        expect(screen.getByText("Smart Budgeting")).toBeInTheDocument();
        expect(screen.getByText("Transaction Tracking")).toBeInTheDocument();
        expect(screen.getByText("Debt Management")).toBeInTheDocument();
    });

    it("renders feature descriptions", () => {
        render(<Features />);
        expect(screen.getByText(/Create and manage budgets with our intuitive interface/i)).toBeInTheDocument();
        expect(screen.getByText(/Easily record and categorize your transactions/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Track and manage your revolving debt with our specialized tools/i)
        ).toBeInTheDocument();
    });

    it("renders feature icons", () => {
        render(<Features />);
        const icons = document.querySelectorAll("svg");
        expect(icons).toHaveLength(3);
    });
});
