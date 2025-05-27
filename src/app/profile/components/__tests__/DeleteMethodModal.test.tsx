import { fireEvent, render, screen } from "@testing-library/react";

import DeleteMethodModal from "../DeleteMethodModal";

describe("DeleteMethodModal", () => {
    const mockMethod = {
        id: "1",
        type: "password",
        provider: "Email",
        lastUsed: "2024-03-20T12:00:00Z",
    };

    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders modal when method is provided", () => {
        render(
            <DeleteMethodModal method={mockMethod} isDeleting={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />
        );

        expect(screen.getByText("Remove Sign-in Method")).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to remove Email as a sign-in method/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
    });

    it("does not render modal when method is null", () => {
        render(<DeleteMethodModal method={null} isDeleting={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

        expect(screen.queryByText("Remove Sign-in Method")).not.toBeInTheDocument();
    });

    it("calls onClose when cancel button is clicked", () => {
        render(
            <DeleteMethodModal method={mockMethod} isDeleting={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />
        );

        const cancelButton = screen.getByRole("button", { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm when remove button is clicked", () => {
        render(
            <DeleteMethodModal method={mockMethod} isDeleting={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />
        );

        const removeButton = screen.getByRole("button", { name: /remove/i });
        fireEvent.click(removeButton);

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("shows loading state on remove button when isDeleting is true", () => {
        render(
            <DeleteMethodModal method={mockMethod} isDeleting={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />
        );

        const removeButton = screen.getByRole("button", { name: /remove/i });
        expect(removeButton).toBeDisabled();
    });
});
