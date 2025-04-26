import { fireEvent, render, screen } from "@testing-library/react";

import TableSearch from "../TableSearch";

describe("TableSearch Component", () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it("renders search input", () => {
        render(<TableSearch value="" onChange={mockOnChange} />);
        expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("displays current value", () => {
        render(<TableSearch value="test" onChange={mockOnChange} />);
        expect(screen.getByPlaceholderText("Search...")).toHaveValue("test");
    });

    it("calls onChange when input value changes", () => {
        render(<TableSearch value="" onChange={mockOnChange} />);
        const input = screen.getByPlaceholderText("Search...");
        fireEvent.change(input, { target: { value: "new value" } });
        expect(mockOnChange).toHaveBeenCalledWith("new value");
    });

    it("shows clear button when value is not empty", () => {
        render(<TableSearch value="test" onChange={mockOnChange} />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("hides clear button when value is empty", () => {
        render(<TableSearch value="" onChange={mockOnChange} />);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("clears input when clear button is clicked", () => {
        render(<TableSearch value="test" onChange={mockOnChange} />);
        fireEvent.click(screen.getByRole("button"));
        expect(mockOnChange).toHaveBeenCalledWith("");
    });
});
