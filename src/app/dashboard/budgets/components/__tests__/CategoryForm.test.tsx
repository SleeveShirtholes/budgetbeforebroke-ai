import { fireEvent, render, screen } from "@testing-library/react";

import { BudgetCategoryName } from "../../types/budget.types";
import { CategoryForm } from "../CategoryForm";
import { act } from "react";

// Mock the budget actions
jest.mock("@/app/actions/budget", () => ({
  createBudgetCategory: jest.fn(),
  updateBudgetCategory: jest.fn(),
}));

const mockSetNewCategory = jest.fn();
const mockSetFormErrors = jest.fn();
const mockOnSave = jest.fn();
const mockOnLoadingChange = jest.fn();
const mockAvailableCategories: BudgetCategoryName[] = [
  "Housing",
  "Food & Groceries",
  "Transportation",
];

const baseProps = {
  budgetId: "test-budget-id",
  newCategory: { name: "Housing" as BudgetCategoryName, amount: "1000" },
  setNewCategory: mockSetNewCategory,
  formErrors: {},
  setFormErrors: mockSetFormErrors,
  availableCategories: mockAvailableCategories,
  isEditing: false,
  onSave: mockOnSave,
  onLoadingChange: mockOnLoadingChange,
};

describe("CategoryForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form with empty state", () => {
    render(
      <CategoryForm {...baseProps} newCategory={{ name: "", amount: "" }} />,
    );

    expect(
      screen.getByPlaceholderText("Select a category"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
    expect(
      screen.getByText("Add another category after this one"),
    ).toBeInTheDocument();
  });

  it("renders form in edit mode", () => {
    render(
      <CategoryForm
        {...baseProps}
        isEditing={true}
        editCategoryId="test-category-id"
      />,
    );

    // Category select should be disabled in edit mode
    const categoryInput = screen.getByLabelText("Category (required)");
    expect(categoryInput).toBeDisabled();
  });

  it("shows error messages when form has errors", () => {
    render(
      <CategoryForm
        {...baseProps}
        newCategory={{ name: "", amount: "" }}
        formErrors={{
          name: "Please select a category",
          amount: "Please enter an amount",
        }}
      />,
    );

    expect(screen.getByText("Please select a category")).toBeInTheDocument();
    expect(screen.getByText("Please enter an amount")).toBeInTheDocument();
  });

  it("handles form submission with add another checked", async () => {
    mockOnSave.mockResolvedValueOnce(true);
    render(
      <CategoryForm
        {...baseProps}
        newCategory={{ name: "Food & Groceries", amount: "100" }}
      />,
    );

    // Check "Add another" checkbox
    const addAnotherCheckbox = screen.getByLabelText(
      "Add another category after this one",
    );
    fireEvent.click(addAnotherCheckbox);

    // Submit the form
    const form = screen.getByTestId("category-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockOnSave).toHaveBeenCalledWith(true);
    expect(mockOnLoadingChange).toHaveBeenCalledWith(true);
  });

  it("handles form submission without add another checked", async () => {
    mockOnSave.mockResolvedValueOnce(true);
    render(
      <CategoryForm
        {...baseProps}
        newCategory={{ name: "Food & Groceries", amount: "100" }}
      />,
    );

    // Submit the form
    const form = screen.getByTestId("category-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockOnSave).toHaveBeenCalledWith(false);
    expect(mockOnLoadingChange).toHaveBeenCalledWith(true);
  });

  it("keeps form populated when save fails", async () => {
    mockOnSave.mockResolvedValueOnce(false);
    const initialCategory = {
      name: "Food & Groceries" as BudgetCategoryName,
      amount: "100",
    };
    render(<CategoryForm {...baseProps} newCategory={initialCategory} />);

    // Submit the form
    const form = screen.getByTestId("category-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockOnSave).toHaveBeenCalledWith(false);
    expect(mockOnLoadingChange).toHaveBeenCalledWith(true);
    // Form should still have the initial values
    expect(screen.getByPlaceholderText("Food & Groceries")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
  });

  it("validates form before submission", async () => {
    render(
      <CategoryForm {...baseProps} newCategory={{ name: "", amount: "" }} />,
    );

    // Submit the form without filling required fields
    const form = screen.getByTestId("category-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockSetFormErrors).toHaveBeenCalled();
  });
});
