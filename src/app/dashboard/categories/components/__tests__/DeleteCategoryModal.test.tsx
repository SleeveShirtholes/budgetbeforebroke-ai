import { render, screen, waitFor } from "@testing-library/react";

import { TRANSACTION_CATEGORIES } from "@/types/transaction";
import userEvent from "@testing-library/user-event";
import DeleteCategoryModal from "../DeleteCategoryModal";

// Mock the deleteCategory and mutate functions
const mockDeleteCategory = jest.fn();
const mockMutate = jest.fn();

jest.mock("@/app/actions/category", () => ({
  deleteCategory: (...args: unknown[]) => mockDeleteCategory(...args),
}));
jest.mock("swr", () => ({
  mutate: (...args: unknown[]) => mockMutate(...args),
}));

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  categoryToDelete: {
    id: "test-category-id",
    name: "Test Category",
    transactionCount: 5,
  },
  selectedAccountId: "test-account-id",
};

describe("DeleteCategoryModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when open", () => {
    render(<DeleteCategoryModal {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Delete Category" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You are about to delete the category/),
    ).toBeInTheDocument();
    expect(screen.getByText("Test Category")).toBeInTheDocument();
    expect(
      screen.getByText(/This category has 5 transactions assigned to it/),
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<DeleteCategoryModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByRole("heading", { name: "Delete Category" }),
    ).not.toBeInTheDocument();
  });

  it("shows confirmation message when category has no transactions", () => {
    render(
      <DeleteCategoryModal
        {...defaultProps}
        categoryToDelete={{
          ...defaultProps.categoryToDelete,
          transactionCount: 0,
        }}
      />,
    );

    expect(
      screen.getByText(/This action cannot be undone/),
    ).toBeInTheDocument();
  });

  it("handles category deletion with unassigned transactions", async () => {
    render(<DeleteCategoryModal {...defaultProps} />);

    const deleteButton = screen.getByRole("button", {
      name: "Delete Category",
    });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith({
        id: defaultProps.categoryToDelete.id,
        reassignToCategoryId: undefined,
      });
      expect(mockMutate).toHaveBeenCalledWith([
        "categories",
        defaultProps.selectedAccountId,
      ]);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("handles category deletion with reassigned transactions", async () => {
    render(<DeleteCategoryModal {...defaultProps} />);

    // Select reassign option
    const reassignRadio = screen.getByLabelText("Assign to another category");
    await userEvent.click(reassignRadio);

    // Select a category from the dropdown
    const categorySelect = screen.getByLabelText("Select category");
    await userEvent.click(categorySelect);

    const firstCategory = screen.getByText(TRANSACTION_CATEGORIES[0]);
    await userEvent.click(firstCategory);

    // Click delete button
    const deleteButton = screen.getByRole("button", {
      name: "Delete Category",
    });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith({
        id: defaultProps.categoryToDelete.id,
        reassignToCategoryId: TRANSACTION_CATEGORIES[0],
      });
      expect(mockMutate).toHaveBeenCalledWith([
        "categories",
        defaultProps.selectedAccountId,
      ]);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("shows loading state during deletion", async () => {
    mockDeleteCategory.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<DeleteCategoryModal {...defaultProps} />);

    const deleteButton = screen.getByRole("button", {
      name: "Delete Category",
    });
    await userEvent.click(deleteButton);

    expect(
      screen.getByText((content) => content.includes("Deleting")),
    ).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
  });

  it("handles deletion error", async () => {
    const error = new Error("Failed to delete category");
    mockDeleteCategory.mockRejectedValue(error);
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<DeleteCategoryModal {...defaultProps} />);

    const deleteButton = screen.getByRole("button", {
      name: "Delete Category",
    });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to delete category:",
        error,
      );
      expect(
        screen.getByRole("button", { name: "Delete Category" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete Category" }),
      ).not.toBeDisabled();
    });

    consoleSpy.mockRestore();
  });

  it("validates replacement category selection when reassigning", async () => {
    render(<DeleteCategoryModal {...defaultProps} />);

    // Select reassign option
    const reassignRadio = screen.getByLabelText("Assign to another category");
    await userEvent.click(reassignRadio);

    // Try to delete without selecting a category
    const deleteButton = screen.getByRole("button", {
      name: "Delete Category",
    });
    await userEvent.click(deleteButton);

    expect(
      screen.getByText("Please select a replacement category"),
    ).toBeInTheDocument();
    expect(mockDeleteCategory).not.toHaveBeenCalled();
  });

  it("handles cancellation", async () => {
    render(<DeleteCategoryModal {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await userEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(mockDeleteCategory).not.toHaveBeenCalled();
  });
});
