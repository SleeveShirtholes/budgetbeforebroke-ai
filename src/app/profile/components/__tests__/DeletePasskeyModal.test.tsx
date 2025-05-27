import { fireEvent, render, screen } from "@testing-library/react";

import DeletePasskeyModal from "../DeletePasskeyModal";
import { Passkey } from "@/lib/auth-types";

describe("DeletePasskeyModal", () => {
    const mockOnClose = jest.fn();
    const mockOnDelete = jest.fn();
    const mockPasskey: Passkey = {
        id: "test-id",
        name: "Test Passkey",
        deviceType: "iPhone",
        createdAt: new Date("2024-03-20"),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders correctly with passkey information", () => {
        render(
            <DeletePasskeyModal isOpen={true} onClose={mockOnClose} onDelete={mockOnDelete} passkey={mockPasskey} />
        );

        expect(screen.getByRole("heading", { name: "Delete Passkey" })).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete this passkey/)).toBeInTheDocument();
        expect(screen.getByText(/Test Passkey/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("calls onClose when cancel button is clicked", () => {
        render(
            <DeletePasskeyModal isOpen={true} onClose={mockOnClose} onDelete={mockOnDelete} passkey={mockPasskey} />
        );

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onDelete when delete button is clicked", () => {
        render(
            <DeletePasskeyModal isOpen={true} onClose={mockOnClose} onDelete={mockOnDelete} passkey={mockPasskey} />
        );

        fireEvent.click(screen.getByRole("button", { name: "Delete" }));
        expect(mockOnDelete).toHaveBeenCalled();
    });

    it("does not render passkey info when passkey is null", () => {
        render(<DeletePasskeyModal isOpen={true} onClose={mockOnClose} onDelete={mockOnDelete} passkey={null} />);

        // The modal title should still be present
        expect(screen.getByRole("heading", { name: "Delete Passkey" })).toBeInTheDocument();
        // The passkey info sentence should not be present
        expect(screen.queryByText(/You are deleting the passkey/)).not.toBeInTheDocument();
    });
});
