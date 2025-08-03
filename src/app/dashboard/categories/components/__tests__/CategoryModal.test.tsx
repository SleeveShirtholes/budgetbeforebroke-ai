import { fireEvent, render, screen, act } from "@testing-library/react";

import CategoryModal from "../CategoryModal";

describe("CategoryModal", () => {
  const baseProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    defaultValues: { name: "", description: "" },
  };

  it("renders add mode", () => {
    render(<CategoryModal {...baseProps} mode="add" />);
    expect(screen.getByText("Add Category")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders edit mode", () => {
    render(
      <CategoryModal
        {...baseProps}
        mode="edit"
        defaultValues={{ name: "Test", description: "Desc" }}
      />,
    );
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

  it("calls onSave when Save/Add is clicked", async () => {
    render(
      <CategoryModal
        {...baseProps}
        defaultValues={{ name: "Test", description: "" }}
      />,
    );
    const form = screen.getByTestId("category-form");
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(baseProps.onSave).toHaveBeenCalledWith({
      name: "Test",
      description: "",
    });
  });
});
