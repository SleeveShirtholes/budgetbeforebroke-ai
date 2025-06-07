import * as budgetActions from "@/app/actions/budget";

import { fireEvent, render, screen } from "@testing-library/react";

import { TestWrapper } from "@/test-utils";
import { act } from "react";
import { BudgetCategoryName } from "../../types/budget.types";
import { CategoryForm } from "../CategoryForm";

// Mock the budget actions
jest.mock("@/app/actions/budget", () => ({
  createBudgetCategory: jest.fn(),
  updateBudgetCategory: jest.fn(),
}));

const mockSetNewCategory = jest.fn();
const mockSetFormErrors = jest.fn();
const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();
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
  onCancel: mockOnCancel,
};

describe("CategoryForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithWrapper = (ui: React.ReactElement) => {
    return render(<TestWrapper>{ui}</TestWrapper>);
  };

  it("renders form with empty state", () => {
    renderWithWrapper(
      <CategoryForm
        budgetId="test-budget-id"
        newCategory={{ name: "", amount: "" }}
        setNewCategory={mockSetNewCategory}
        formErrors={{}}
        setFormErrors={mockSetFormErrors}
        availableCategories={mockAvailableCategories}
        isEditing={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
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
    renderWithWrapper(
      <CategoryForm
        budgetId="test-budget-id"
        newCategory={{ name: "Housing", amount: "1000" }}
        setNewCategory={mockSetNewCategory}
        formErrors={{}}
        setFormErrors={mockSetFormErrors}
        availableCategories={mockAvailableCategories}
        isEditing={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        editCategoryId="test-category-id"
      />,
    );

    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Save & Add Another")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("shows error messages when form has errors", () => {
    renderWithWrapper(
      <CategoryForm
        budgetId="test-budget-id"
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
      />,
    );

    expect(screen.getByText("Please select a category")).toBeInTheDocument();
    expect(screen.getByText("Please enter an amount")).toBeInTheDocument();
  });

  it("calls onSave with false when Add button is clicked", async () => {
    render(
      <TestWrapper>
        <CategoryForm {...baseProps} newCategory={{ name: "", amount: "" }} />
      </TestWrapper>,
    );
    // Open the dropdown and select the option
    const nameInput = screen.getByPlaceholderText("Select a category");
    fireEvent.click(nameInput);
    const option = await screen.findByText("Food & Groceries");
    fireEvent.click(option);
    // Fill in required form fields
    const amountInput = screen.getByPlaceholderText("0.00");
    fireEvent.change(amountInput, { target: { value: "100" } });

    await act(async () => {
      fireEvent.click(screen.getByText("Add"));
    });

    expect(budgetActions.createBudgetCategory).toHaveBeenCalledWith(
      "test-budget-id",
      "Food & Groceries",
      100,
    );
    expect(mockOnSave).toHaveBeenCalledWith(false);
  });

  it("calls onSave with true when Add & Add Another button is clicked", async () => {
    render(
      <TestWrapper>
        <CategoryForm {...baseProps} newCategory={{ name: "", amount: "" }} />
      </TestWrapper>,
    );
    // Open the dropdown and select the option
    const nameInput = screen.getByPlaceholderText("Select a category");
    fireEvent.click(nameInput);
    const option = await screen.findByText("Food & Groceries");
    fireEvent.click(option);
    // Fill in required form fields
    const amountInput = screen.getByPlaceholderText("0.00");
    fireEvent.change(amountInput, { target: { value: "100" } });

    await act(async () => {
      fireEvent.click(screen.getByText("Add & Add Another"));
    });

    expect(budgetActions.createBudgetCategory).toHaveBeenCalledWith(
      "test-budget-id",
      "Food & Groceries",
      100,
    );
    expect(mockOnSave).toHaveBeenCalledWith(true);
  });

  it("calls onCancel when Cancel button is clicked", async () => {
    render(
      <TestWrapper>
        <CategoryForm {...baseProps} />
      </TestWrapper>,
    );
    await act(async () => {
      fireEvent.click(screen.getByText("Cancel"));
    });
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
