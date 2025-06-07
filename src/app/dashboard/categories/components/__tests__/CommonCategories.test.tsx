import { fireEvent, render, screen } from "@testing-library/react";

import { TRANSACTION_CATEGORIES } from "@/types/transaction";
import CommonCategories from "../CommonCategories";

describe("CommonCategories", () => {
  const mockOnAddCategory = jest.fn();
  const mockOnDeleteCategory = jest.fn();
  const mockExistingCategories = ["Food", "Transportation"];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all transaction categories", () => {
    render(
      <CommonCategories
        onAddCategory={mockOnAddCategory}
        existingCategories={mockExistingCategories}
        onDeleteCategory={mockOnDeleteCategory}
      />,
    );

    TRANSACTION_CATEGORIES.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it("shows enabled state for existing categories", () => {
    render(
      <CommonCategories
        onAddCategory={mockOnAddCategory}
        existingCategories={mockExistingCategories}
        onDeleteCategory={mockOnDeleteCategory}
      />,
    );

    mockExistingCategories.forEach((category) => {
      const button = screen.getByText(category);
      expect(button).toHaveClass("bg-primary-100");
    });
  });

  it("shows disabled state for non-existing categories", () => {
    render(
      <CommonCategories
        onAddCategory={mockOnAddCategory}
        existingCategories={mockExistingCategories}
        onDeleteCategory={mockOnDeleteCategory}
      />,
    );

    const nonExistingCategory = "Housing";
    const button = screen.getByText(nonExistingCategory);
    expect(button).toHaveClass("bg-gray-100");
  });

  it("calls onAddCategory when clicking a disabled category", () => {
    render(
      <CommonCategories
        onAddCategory={mockOnAddCategory}
        existingCategories={mockExistingCategories}
        onDeleteCategory={mockOnDeleteCategory}
      />,
    );

    const nonExistingCategory = "Housing";
    const button = screen.getByText(nonExistingCategory);
    fireEvent.click(button);

    expect(mockOnAddCategory).toHaveBeenCalledWith(nonExistingCategory);
    expect(mockOnDeleteCategory).not.toHaveBeenCalled();
  });

  it("calls onDeleteCategory when clicking an enabled category", () => {
    render(
      <CommonCategories
        onAddCategory={mockOnAddCategory}
        existingCategories={mockExistingCategories}
        onDeleteCategory={mockOnDeleteCategory}
      />,
    );

    const existingCategory = "Food";
    const button = screen.getByText(existingCategory);
    fireEvent.click(button);

    expect(mockOnDeleteCategory).toHaveBeenCalledWith(existingCategory);
    expect(mockOnAddCategory).not.toHaveBeenCalled();
  });

  it("renders XMarkIcon for enabled categories", () => {
    render(
      <CommonCategories
        onAddCategory={mockOnAddCategory}
        existingCategories={mockExistingCategories}
        onDeleteCategory={mockOnDeleteCategory}
      />,
    );

    mockExistingCategories.forEach((category) => {
      const button = screen.getByText(category);
      expect(button.querySelector("svg")).toBeInTheDocument();
    });
  });

  it("does not render XMarkIcon for disabled categories", () => {
    render(
      <CommonCategories
        onAddCategory={mockOnAddCategory}
        existingCategories={mockExistingCategories}
        onDeleteCategory={mockOnDeleteCategory}
      />,
    );

    const nonExistingCategory = "Housing";
    const button = screen.getByText(nonExistingCategory);
    expect(button.querySelector("svg")).not.toBeInTheDocument();
  });
});
