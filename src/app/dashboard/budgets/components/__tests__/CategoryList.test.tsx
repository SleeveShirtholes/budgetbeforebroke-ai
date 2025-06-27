import { fireEvent, render, screen } from "@testing-library/react";

import { BudgetCategory } from "../../types/budget.types";
import { CategoryList } from "../CategoryList";

const mockCategories: BudgetCategory[] = [
  {
    id: "1",
    name: "Housing",
    amount: 1000,
    color: "#4F46E5",
  },
  {
    id: "2",
    name: "Food & Groceries",
    amount: 500,
    color: "#10B981",
  },
];

describe("CategoryList", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockSetDeleteConfirmId = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no categories", () => {
    render(
      <CategoryList
        categories={[]}
        searchQuery=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        deleteConfirmId={null}
        setDeleteConfirmId={mockSetDeleteConfirmId}
        isDeleting={false}
      />,
    );

    expect(screen.getByText("No budget categories")).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return (
          element?.textContent ===
          "Click Add Category to create your first budget category."
        );
      }),
    ).toBeInTheDocument();
  });

  it("renders list of categories", () => {
    render(
      <CategoryList
        categories={mockCategories}
        searchQuery=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        deleteConfirmId={null}
        setDeleteConfirmId={mockSetDeleteConfirmId}
        isDeleting={false}
      />,
    );

    expect(screen.getByText("Housing")).toBeInTheDocument();
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText("Food & Groceries")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <CategoryList
        categories={mockCategories}
        searchQuery=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        deleteConfirmId={null}
        setDeleteConfirmId={mockSetDeleteConfirmId}
        isDeleting={false}
      />,
    );

    const editButtons = screen.getAllByLabelText("Edit category");
    fireEvent.click(editButtons[0]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockCategories[0]);
  });

  it("shows delete confirmation when delete button is clicked", () => {
    render(
      <CategoryList
        categories={mockCategories}
        searchQuery=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        deleteConfirmId={null}
        setDeleteConfirmId={mockSetDeleteConfirmId}
        isDeleting={false}
      />,
    );

    const deleteButtons = screen.getAllByLabelText("Delete category");
    fireEvent.click(deleteButtons[0]);
    expect(mockSetDeleteConfirmId).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when confirm button is clicked", () => {
    render(
      <CategoryList
        categories={mockCategories}
        searchQuery=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        deleteConfirmId="1"
        setDeleteConfirmId={mockSetDeleteConfirmId}
        isDeleting={false}
      />,
    );

    const confirmButton = screen.getByRole("button", { name: /confirm\?/i });
    fireEvent.click(confirmButton);
    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });

  it("disables delete buttons and shows loading state when isDeleting is true", () => {
    render(
      <CategoryList
        categories={mockCategories}
        searchQuery=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        deleteConfirmId="1"
        setDeleteConfirmId={mockSetDeleteConfirmId}
        isDeleting={true}
      />,
    );

    const deleteButtons = screen.getAllByLabelText("Delete category");
    deleteButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    const confirmButton = screen.getByRole("button", { name: /confirm\?/i });
    expect(confirmButton).toBeDisabled();
    expect(confirmButton.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
