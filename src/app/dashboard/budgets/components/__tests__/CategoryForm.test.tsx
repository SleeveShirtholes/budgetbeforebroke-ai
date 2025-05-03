import { fireEvent, render, screen } from "@testing-library/react";

import { BudgetCategoryName } from "../../types/budget.types";
import { CategoryForm } from "../CategoryForm";

const mockAvailableCategories: BudgetCategoryName[] = [
  "Housing",
  "Food & Groceries",
  "Transportation",
];

describe("CategoryForm", () => {
  const mockSetNewCategory = jest.fn();
  const mockSetFormErrors = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const mockCustomSelectRef = { current: null };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form with empty state", () => {
    render(
      <CategoryForm
        newCategory={{ name: "", amount: "" }}
        setNewCategory={mockSetNewCategory}
        formErrors={{}}
        setFormErrors={mockSetFormErrors}
        availableCategories={mockAvailableCategories}
        isEditing={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        customSelectRef={mockCustomSelectRef}
      />,
    );

    expect(
      screen.getByPlaceholderText("Select a category"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.getByText("Add & Add Another")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders form in edit mode", () => {
    render(
      <CategoryForm
        newCategory={{ name: "Housing", amount: "1000" }}
        setNewCategory={mockSetNewCategory}
        formErrors={{}}
        setFormErrors={mockSetFormErrors}
        availableCategories={mockAvailableCategories}
        isEditing={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        customSelectRef={mockCustomSelectRef}
      />,
    );

    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Save & Add Another")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("shows error messages when form has errors", () => {
    render(
      <CategoryForm
        newCategory={{ name: "", amount: "" }}
        setNewCategory={mockSetNewCategory}
        formErrors={{
          name: "Please select a category",
          amount: "Please enter an amount",
        }}
        setFormErrors={mockSetFormErrors}
        availableCategories={mockAvailableCategories}
        isEditing={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        customSelectRef={mockCustomSelectRef}
      />,
    );

    expect(screen.getByText("Please select a category")).toBeInTheDocument();
    expect(screen.getByText("Please enter an amount")).toBeInTheDocument();
  });

  it("calls onSave with false when Add button is clicked", () => {
    render(
      <CategoryForm
        newCategory={{ name: "Housing", amount: "1000" }}
        setNewCategory={mockSetNewCategory}
        formErrors={{}}
        setFormErrors={mockSetFormErrors}
        availableCategories={mockAvailableCategories}
        isEditing={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        customSelectRef={mockCustomSelectRef}
      />,
    );

    fireEvent.click(screen.getByText("Add"));
    expect(mockOnSave).toHaveBeenCalledWith(false);
  });

  it("calls onSave with true when Add & Add Another button is clicked", () => {
    render(
      <CategoryForm
        newCategory={{ name: "Housing", amount: "1000" }}
        setNewCategory={mockSetNewCategory}
        formErrors={{}}
        setFormErrors={mockSetFormErrors}
        availableCategories={mockAvailableCategories}
        isEditing={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        customSelectRef={mockCustomSelectRef}
      />,
    );

    fireEvent.click(screen.getByText("Add & Add Another"));
    expect(mockOnSave).toHaveBeenCalledWith(true);
  });

  it("calls onCancel when Cancel button is clicked", () => {
    render(
      <CategoryForm
        newCategory={{ name: "Housing", amount: "1000" }}
        setNewCategory={mockSetNewCategory}
        formErrors={{}}
        setFormErrors={mockSetFormErrors}
        availableCategories={mockAvailableCategories}
        isEditing={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        customSelectRef={mockCustomSelectRef}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
