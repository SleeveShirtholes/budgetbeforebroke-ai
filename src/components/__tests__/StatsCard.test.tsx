import { render, screen } from "@testing-library/react";

import StatsCard from "../StatsCard";

describe("StatsCard", () => {
    const defaultProps = {
        title: "Total Revenue",
        value: "$1,234.56",
    };

    it("renders with basic props", () => {
        render(<StatsCard {...defaultProps} />);

        expect(screen.getByText("Total Revenue")).toBeInTheDocument();
        expect(screen.getByText("$1,234.56")).toBeInTheDocument();
    });

    it("renders with icon", () => {
        const mockIcon = <svg data-testid="mock-icon" />;
        render(<StatsCard {...defaultProps} icon={mockIcon} />);

        expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
        expect(screen.getByTestId("mock-icon").parentElement).toHaveClass(
            "bg-secondary-50",
            "rounded-full",
            "ring-4",
            "ring-secondary-100"
        );
    });

    it("renders with positive trend", () => {
        const props = {
            ...defaultProps,
            trend: {
                value: 12,
                isPositive: true,
            },
        };

        render(<StatsCard {...props} />);

        expect(screen.getByText("+12%")).toBeInTheDocument();
        expect(screen.getByText("+12%").parentElement).toHaveClass("text-secondary-600");

        // Check if arrow is rotated for positive trend
        const arrow = screen.getByTestId("trend-arrow");
        expect(arrow).toHaveClass("transform", "rotate-180");
    });

    it("renders with negative trend", () => {
        const props = {
            ...defaultProps,
            trend: {
                value: 8,
                isPositive: false,
            },
        };

        render(<StatsCard {...props} />);

        expect(screen.getByText("-8%")).toBeInTheDocument();
        expect(screen.getByText("-8%").parentElement).toHaveClass("text-accent-700");

        // Check if arrow is not rotated for negative trend
        const arrow = screen.getByTestId("trend-arrow");
        expect(arrow).not.toHaveClass("rotate-180");
    });

    it("renders with numeric value", () => {
        render(<StatsCard title="Count" value={42} />);
        expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("handles missing optional props", () => {
        render(<StatsCard {...defaultProps} />);

        // Icon should not be present
        expect(screen.queryByTestId("mock-icon")).not.toBeInTheDocument();

        // Trend section should not be present
        expect(screen.queryByText("%")).not.toBeInTheDocument();
    });
});
