import { fireEvent, render, screen } from "@testing-library/react";

import CategoryModal from "../CategoryModal";

describe("CategoryModal", () => {
    const baseProps = {
        isOpen: true,
        onClose: jest.fn(),
        onSave: jest.fn(),
        form: { name: "", description: "" },
        setForm: jest.fn(),
    };

    it("renders add mode", () => {
        render(<CategoryModal {...baseProps} mode="add" />);
        expect(screen.getByText("Add Category")).toBeInTheDocument();
        expect(screen.getByText("Add")).toBeInTheDocument();
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("renders edit mode", () => {
        render(<CategoryModal {...baseProps} mode="edit" form={{ name: "Test", description: "Desc" }} />);
        expect(screen.getByText("Edit Category")).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Desc")).toBeInTheDocument();
    });

    it("calls onClose when Cancel is clicked", () => {
        render(<CategoryModal {...baseProps} />);
        fireEvent.click(screen.getByText("Cancel"));
        expect(baseProps.onClose).toHaveBeenCalled();
    });

    it("calls onSave when Save/Add is clicked", () => {
        render(<CategoryModal {...baseProps} form={{ name: "Test", description: "" }} />);
        fireEvent.click(screen.getByText("Add"));
        expect(baseProps.onSave).toHaveBeenCalled();
    });
});
