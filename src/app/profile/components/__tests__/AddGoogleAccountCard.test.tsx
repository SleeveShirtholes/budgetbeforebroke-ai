import { fireEvent, render, screen } from "@testing-library/react";

import AddGoogleAccountCard from "../AddGoogleAccountCard";

describe("AddGoogleAccountCard", () => {
    const mockOnAdd = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the Google account connection option", () => {
        render(<AddGoogleAccountCard isLoading={false} onAdd={mockOnAdd} />);
        expect(screen.getByText("Google")).toBeInTheDocument();
        expect(screen.getByText("Not connected")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /connect google account/i })).toBeInTheDocument();
    });

    it("calls onAdd when connect button is clicked", () => {
        render(<AddGoogleAccountCard isLoading={false} onAdd={mockOnAdd} />);
        const connectButton = screen.getByRole("button", { name: /connect google account/i });
        fireEvent.click(connectButton);
        expect(mockOnAdd).toHaveBeenCalledTimes(1);
    });

    it("disables the connect button when isLoading is true", () => {
        render(<AddGoogleAccountCard isLoading={true} onAdd={mockOnAdd} />);
        const connectButton = screen.getByRole("button", { name: /connect google account/i });
        expect(connectButton).toBeDisabled();
    });
});
