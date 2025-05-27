import { fireEvent, render, screen } from "@testing-library/react";

import SignInMethodCard from "../SignInMethodCard";

describe("SignInMethodCard", () => {
    const mockMethod = {
        id: "1",
        type: "password",
        provider: "Email",
        lastUsed: "2024-03-20T12:00:00Z",
    };

    const mockOnDelete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders method details correctly", () => {
        render(<SignInMethodCard method={mockMethod} onDelete={mockOnDelete} />);

        expect(screen.getByText("Email Password")).toBeInTheDocument();
        expect(screen.getByText(/Last used:/)).toBeInTheDocument();
        expect(screen.getByText(/Last used:.*March 20th, 2024/)).toBeInTheDocument();
    });

    it("calls onDelete when delete button is clicked", () => {
        render(<SignInMethodCard method={mockMethod} onDelete={mockOnDelete} />);

        const deleteButton = screen.getByRole("button");
        fireEvent.click(deleteButton);

        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
});
