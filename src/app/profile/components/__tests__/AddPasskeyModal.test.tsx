import { fireEvent, render, screen } from "@testing-library/react";

import AddPasskeyModal from "../AddPasskeyModal";

describe("AddPasskeyModal", () => {
    const mockOnClose = jest.fn();
    const mockOnAdd = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders correctly", () => {
        render(<AddPasskeyModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} isLoading={false} />);

        expect(screen.getByRole("heading", { name: "Add Passkey" })).toBeInTheDocument();
        expect(screen.getByText(/Add a new passkey to your account/)).toBeInTheDocument();
        expect(screen.getByLabelText("Passkey Name (Optional)")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Add Passkey" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("calls onClose when cancel button is clicked", () => {
        render(<AddPasskeyModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} isLoading={false} />);

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onAdd when add passkey button is clicked", () => {
        render(<AddPasskeyModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} isLoading={false} />);

        fireEvent.click(screen.getByRole("button", { name: "Add Passkey" }));
        expect(mockOnAdd).toHaveBeenCalled();
    });

    it("shows loading state when isLoading is true", () => {
        render(<AddPasskeyModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} isLoading={true} />);

        expect(screen.getByRole("button", { name: "Adding..." })).toBeDisabled();
    });
});
