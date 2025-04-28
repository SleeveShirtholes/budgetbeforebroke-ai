import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import CustomSelect from "../CustomSelect";

const mockOptions = [
    { value: "option1", label: "First Option" },
    { value: "option2", label: "Second Option" },
    { value: "option3", label: "Third Option" },
];

describe("CustomSelect", () => {
    const defaultProps = {
        label: "Test Select",
        options: mockOptions,
        value: "option1",
        onChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders with default props", () => {
        render(<CustomSelect {...defaultProps} />);
        expect(screen.getByText("Test Select")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("First Option")).toBeInTheDocument();
    });

    it("shows required asterisk when required prop is true", () => {
        render(<CustomSelect {...defaultProps} required />);
        expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("shows helper text when provided", () => {
        render(<CustomSelect {...defaultProps} helperText="Help text" />);
        expect(screen.getByText("Help text")).toBeInTheDocument();
    });

    it("shows error message when provided", () => {
        render(<CustomSelect {...defaultProps} error="Error message" />);
        expect(screen.getByText("Error message")).toBeInTheDocument();
    });

    it("opens dropdown when clicking the input", async () => {
        render(<CustomSelect {...defaultProps} />);
        const input = screen.getByPlaceholderText("First Option");
        await userEvent.click(input);

        expect(screen.getByText("Second Option")).toBeInTheDocument();
        expect(screen.getByText("Third Option")).toBeInTheDocument();
    });

    it("filters options when typing", async () => {
        render(<CustomSelect {...defaultProps} />);
        const input = screen.getByPlaceholderText("First Option");

        await userEvent.type(input, "Second");

        expect(screen.getByText("Second Option")).toBeInTheDocument();
        expect(screen.queryByText("First Option")).not.toBeInTheDocument();
        expect(screen.queryByText("Third Option")).not.toBeInTheDocument();
    });

    it("calls onChange when selecting an option", async () => {
        render(<CustomSelect {...defaultProps} />);
        const input = screen.getByPlaceholderText("First Option");

        await userEvent.click(input);
        await userEvent.click(screen.getByText("Second Option"));

        expect(defaultProps.onChange).toHaveBeenCalledWith("option2");
    });

    it("shows clear button when text is entered and clears on click", async () => {
        render(<CustomSelect {...defaultProps} />);
        const input = screen.getByPlaceholderText("First Option");

        await userEvent.type(input, "test");
        const clearButton = screen.getByRole("button");
        expect(clearButton).toBeInTheDocument();

        await userEvent.click(clearButton);
        expect(input).toHaveValue("");
    });

    it("selects first filtered option on Enter key", async () => {
        render(<CustomSelect {...defaultProps} />);
        const input = screen.getByPlaceholderText("First Option");

        await userEvent.type(input, "Second");
        await userEvent.keyboard("{Enter}");

        expect(defaultProps.onChange).toHaveBeenCalledWith("option2");
    });

    it("closes dropdown on Escape key", async () => {
        render(<CustomSelect {...defaultProps} />);
        const input = screen.getByPlaceholderText("First Option");

        await userEvent.click(input);
        expect(screen.getByText("Second Option")).toBeInTheDocument();

        await userEvent.keyboard("{Escape}");
        // Wait for animation to complete
        await new Promise((resolve) => setTimeout(resolve, 150));
        expect(screen.queryByText("Second Option")).not.toBeInTheDocument();
    });

    it("is disabled when disabled prop is true", () => {
        render(<CustomSelect {...defaultProps} disabled />);
        const input = screen.getByPlaceholderText("First Option");
        expect(input).toBeDisabled();
    });

    it("maintains selected value when filtering and clearing", async () => {
        const { rerender } = render(<CustomSelect {...defaultProps} value="option2" />);
        const input = screen.getByPlaceholderText("Second Option");

        await userEvent.type(input, "Third");
        expect(screen.getByText("Third Option")).toBeInTheDocument();

        const clearButton = screen.getByRole("button");
        await userEvent.click(clearButton);

        rerender(<CustomSelect {...defaultProps} value="option2" />);
        expect(screen.getByPlaceholderText("Second Option")).toBeInTheDocument();
    });
});
