import { fireEvent, render, screen } from "@testing-library/react";

import ColumnFilter from "../ColumnFilter";
import { FilterValue } from "../types";

describe("ColumnFilter Component", () => {
    const mockOnFilterChange = jest.fn();
    const columnKey = "test";

    beforeEach(() => {
        mockOnFilterChange.mockClear();
    });

    it("renders filter button", () => {
        render(<ColumnFilter columnKey={columnKey} onFilterChange={mockOnFilterChange} />);
        expect(screen.getByTitle("Filter column")).toBeInTheDocument();
    });

    it("opens filter dropdown when clicked", () => {
        render(<ColumnFilter columnKey={columnKey} onFilterChange={mockOnFilterChange} />);
        fireEvent.click(screen.getByTitle("Filter column"));
        expect(screen.getByText("Operator")).toBeInTheDocument();
        expect(screen.getByText("Value")).toBeInTheDocument();
    });

    it("applies filter when Apply button is clicked", () => {
        render(<ColumnFilter columnKey={columnKey} onFilterChange={mockOnFilterChange} />);

        // Open filter
        fireEvent.click(screen.getByTitle("Filter column"));

        // Set operator and value
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "equals" } });
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "test value" } });

        // Apply filter
        fireEvent.click(screen.getByText("Apply"));

        expect(mockOnFilterChange).toHaveBeenCalledWith(columnKey, {
            operator: "equals",
            value: "test value",
        });
    });

    it("clears filter when Clear button is clicked", () => {
        const currentFilter: FilterValue = {
            operator: "contains",
            value: "test",
        };

        render(
            <ColumnFilter columnKey={columnKey} currentFilter={currentFilter} onFilterChange={mockOnFilterChange} />
        );

        // Open filter
        fireEvent.click(screen.getByTitle("Filter column"));

        // Clear filter
        fireEvent.click(screen.getByText("Clear"));

        expect(mockOnFilterChange).toHaveBeenCalledWith(columnKey, null);
    });

    it("shows current filter values when provided", () => {
        const currentFilter: FilterValue = {
            operator: "equals",
            value: "test value",
        };

        render(
            <ColumnFilter columnKey={columnKey} currentFilter={currentFilter} onFilterChange={mockOnFilterChange} />
        );

        // Open filter
        fireEvent.click(screen.getByTitle("Filter column"));

        expect(screen.getByRole("combobox")).toHaveValue("equals");
        expect(screen.getByRole("textbox")).toHaveValue("test value");
    });

    it("applies filter when Enter is pressed in value input", () => {
        render(<ColumnFilter columnKey={columnKey} onFilterChange={mockOnFilterChange} />);

        // Open filter
        fireEvent.click(screen.getByTitle("Filter column"));

        // Set value and press Enter
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "test value" } });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(mockOnFilterChange).toHaveBeenCalledWith(columnKey, {
            operator: "contains",
            value: "test value",
        });
    });

    it("doesn't apply filter when value is empty", () => {
        render(<ColumnFilter columnKey={columnKey} onFilterChange={mockOnFilterChange} />);

        // Open filter
        fireEvent.click(screen.getByTitle("Filter column"));

        // Try to apply empty filter
        fireEvent.click(screen.getByText("Apply"));

        expect(mockOnFilterChange).toHaveBeenCalledWith(columnKey, null);
    });

    it("closes filter dropdown when clicking outside", () => {
        render(
            <div>
                <div data-testid="outside">Outside element</div>
                <ColumnFilter columnKey={columnKey} onFilterChange={mockOnFilterChange} />
            </div>
        );

        // Open filter
        fireEvent.click(screen.getByTitle("Filter column"));
        expect(screen.getByText("Operator")).toBeInTheDocument();

        // Click outside
        fireEvent.mouseDown(screen.getByTestId("outside"));

        // Verify dropdown is closed
        expect(screen.queryByText("Operator")).not.toBeInTheDocument();
    });
});
