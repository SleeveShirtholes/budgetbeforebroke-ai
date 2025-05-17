import { SupportCategory, SupportStatus } from "../../types";
import { fireEvent, render, screen } from "@testing-library/react";

import NewRequestModal from "../NewRequestModal";

describe("NewRequestModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();
    const mockOnNewRequestChange = jest.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSubmit: mockOnSubmit,
        onNewRequestChange: mockOnNewRequestChange,
        newRequest: {
            title: "",
            description: "",
            category: "Issue" as SupportCategory,
            status: "Open" as SupportStatus,
            isPublic: false,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the modal title", () => {
        render(<NewRequestModal {...defaultProps} />);
        expect(screen.getByText("Create New Support Request")).toBeInTheDocument();
    });

    it("renders all form fields", () => {
        render(<NewRequestModal {...defaultProps} />);
        expect(screen.getByPlaceholderText("Briefly describe your issue")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Issue")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Open")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Provide a detailed description of the problem or request...")
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Make this request public (visible to other users)")).toBeInTheDocument();
    });

    it("calls onNewRequestChange when title is changed", () => {
        render(<NewRequestModal {...defaultProps} />);
        const titleInput = screen.getByPlaceholderText("Briefly describe your issue");
        fireEvent.change(titleInput, { target: { value: "New Title" } });
        expect(mockOnNewRequestChange).toHaveBeenCalledWith("title", "New Title");
    });

    it("calls onNewRequestChange when category is changed", () => {
        render(<NewRequestModal {...defaultProps} />);
        // Click the category input to open the dropdown
        const categoryInput = screen.getByPlaceholderText("Issue");
        fireEvent.click(categoryInput);
        // Click the 'Feature Request' option
        const option = screen.getByText("Feature Request");
        fireEvent.click(option);
        expect(mockOnNewRequestChange).toHaveBeenCalledWith("category", "Feature Request");
    });

    it("calls onNewRequestChange when public checkbox is changed", () => {
        render(<NewRequestModal {...defaultProps} />);
        const publicCheckbox = screen.getByLabelText("Make this request public (visible to other users)");
        fireEvent.click(publicCheckbox);
        expect(mockOnNewRequestChange).toHaveBeenCalledWith("isPublic", true);
    });

    it("calls onSubmit when form is submitted", () => {
        render(<NewRequestModal {...defaultProps} />);
        const form = screen.getByTestId("new-request-form");
        fireEvent.submit(form);
        expect(mockOnSubmit).toHaveBeenCalled();
    });

    it("calls onClose when cancel button is clicked", () => {
        render(<NewRequestModal {...defaultProps} />);
        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("does not render when isOpen is false", () => {
        render(<NewRequestModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("Create New Support Request")).not.toBeInTheDocument();
    });
});
