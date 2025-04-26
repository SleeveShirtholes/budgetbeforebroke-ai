import { render, screen } from "@testing-library/react";

import MonthlySpendingChart from "../MonthlySpendingChart";

// Mock the react-chartjs-2 Line component
jest.mock("react-chartjs-2", () => ({
    Line: () => <div data-testid="mock-line-chart">Line Chart</div>,
}));

// Mock the chart.js components
jest.mock("chart.js", () => ({
    Chart: {
        register: jest.fn(),
    },
}));

describe("MonthlySpendingChart", () => {
    const mockData = [
        { month: "Jan", amount: 1000 },
        { month: "Feb", amount: 1500 },
        { month: "Mar", amount: 1200 },
    ];

    it("renders without crashing", () => {
        render(<MonthlySpendingChart data={mockData} />);
        expect(screen.getByTestId("mock-line-chart")).toBeInTheDocument();
    });

    it("renders with the correct container styles", () => {
        const { container } = render(<MonthlySpendingChart data={mockData} />);
        const chartContainer = container.firstChild;
        expect(chartContainer).toHaveClass("bg-white", "rounded-xl", "shadow", "p-6", "border", "border-secondary-100");
    });

    it("renders with a height container", () => {
        const { container } = render(<MonthlySpendingChart data={mockData} />);
        // Find div with any class that starts with 'h-'
        const heightContainer = container.querySelector('div[class*="h-"]');
        expect(heightContainer).toBeInTheDocument();
    });
});
