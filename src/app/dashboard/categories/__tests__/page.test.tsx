import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/app/actions/category";
import { render, screen, waitFor } from "@testing-library/react";

import { ToastProvider } from "@/components/Toast";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import userEvent from "@testing-library/user-event";
import CategoriesPage from "../page";

interface Category {
  id: string;
  name: string;
  description?: string;
  transactionCount?: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: { name: string; description: string }) => void;
}

interface CategoryTableProps {
  categories: Category[];
  getRowActions: (category: Category) => Array<{ onClick: () => void }>;
}

interface CommonCategoriesProps {
  onAddCategory: (name: string) => void;
}

interface SWRResponse<T> {
  data?: T;
  error?: Error;
  isLoading: boolean;
}

// Mock the hooks and actions
jest.mock("@/stores/budgetAccountStore");
jest.mock("@/app/actions/category");

// Factory for useSWR mock
let mockSwrReturnValue: SWRResponse<Category[]> = { isLoading: false };
jest.mock("swr", () => ({
  __esModule: true,
  default: () => mockSwrReturnValue,
  mutate: jest.fn(),
}));

// Mock the components
jest.mock("../components/CategoryModal", () => {
  return {
    __esModule: true,
    default: function MockCategoryModal({
      isOpen,
      onClose,
      onSave,
    }: CategoryModalProps) {
      if (!isOpen) return null;
      return (
        <div data-testid="category-modal">
          <button
            onClick={() =>
              onSave({ name: "Test Category", description: "Test Description" })
            }
          >
            Save
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      );
    },
  };
});

jest.mock("../components/CategoryTable", () => {
  return {
    __esModule: true,
    default: function MockCategoryTable({
      categories,
      getRowActions,
    }: CategoryTableProps) {
      return (
        <div data-testid="category-table">
          {categories.map((category) => (
            <div key={category.id} data-testid={`category-${category.id}`}>
              {category.name}
              <button onClick={() => getRowActions(category)[0].onClick()}>
                Edit
              </button>
              <button onClick={() => getRowActions(category)[1].onClick()}>
                Delete
              </button>
            </div>
          ))}
        </div>
      );
    },
  };
});

jest.mock("../components/CommonCategories", () => {
  return {
    __esModule: true,
    default: function MockCommonCategories({
      onAddCategory,
    }: CommonCategoriesProps) {
      return (
        <div data-testid="common-categories">
          <button onClick={() => onAddCategory("Common Category")}>
            Add Common
          </button>
        </div>
      );
    },
  };
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ToastProvider>{ui}</ToastProvider>);
};

describe("CategoriesPage", () => {
  const mockCategories = [
    {
      id: "1",
      name: "Test Category 1",
      description: "Description 1",
      transactionCount: 5,
    },
    {
      id: "2",
      name: "Test Category 2",
      description: "Description 2",
      transactionCount: 3,
    },
  ];

  const mockAccount = {
    id: "123",
    name: "Test Account",
  };

  beforeEach(() => {
    // Reset mockSwrReturnValue for each test
    mockSwrReturnValue = { isLoading: false };
    // Mock useBudgetAccount
    (useBudgetAccount as jest.Mock).mockReturnValue({
      selectedAccount: mockAccount,
      isLoading: false,
    });

    // Mock getCategories
    (getCategories as jest.Mock).mockResolvedValue(mockCategories);

    // Mock createCategory
    (createCategory as jest.Mock).mockResolvedValue({
      id: "3",
      name: "New Category",
    });

    // Mock updateCategory
    (updateCategory as jest.Mock).mockResolvedValue({
      id: "1",
      name: "Updated Category",
    });

    // Mock deleteCategory
    (deleteCategory as jest.Mock).mockResolvedValue(undefined);
  });

  it("renders loading state when account is loading", () => {
    (useBudgetAccount as jest.Mock).mockReturnValue({
      selectedAccount: null,
      isLoading: true,
    });
    mockSwrReturnValue = { data: undefined, error: undefined, isLoading: true };
    renderWithProviders(<CategoriesPage />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders categories table when data is loaded", async () => {
    mockSwrReturnValue = {
      data: mockCategories,
      error: undefined,
      isLoading: false,
    };
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("category-table")).toBeInTheDocument();
    });

    mockCategories.forEach((category) => {
      expect(screen.getByTestId(`category-${category.id}`)).toBeInTheDocument();
    });
  });

  it("opens add modal when Add Category button is clicked", async () => {
    mockSwrReturnValue = {
      data: mockCategories,
      error: undefined,
      isLoading: false,
    };
    renderWithProviders(<CategoriesPage />);

    const addButton = screen.getByText("Add Category");
    await userEvent.click(addButton);

    expect(screen.getByTestId("category-modal")).toBeInTheDocument();
  });

  it("handles adding a new category", async () => {
    mockSwrReturnValue = {
      data: mockCategories,
      error: undefined,
      isLoading: false,
    };
    renderWithProviders(<CategoriesPage />);

    // Open add modal
    const addButton = screen.getByText("Add Category");
    await userEvent.click(addButton);

    // Save new category
    const saveButton = screen.getByText("Save");
    await userEvent.click(saveButton);

    expect(createCategory).toHaveBeenCalledWith({
      name: "Test Category",
      description: "Test Description",
      budgetAccountId: mockAccount.id,
    });
  });

  it("handles editing a category", async () => {
    mockSwrReturnValue = {
      data: mockCategories,
      error: undefined,
      isLoading: false,
    };
    renderWithProviders(<CategoriesPage />);
    await waitFor(() => {
      expect(screen.getByTestId("category-table")).toBeInTheDocument();
    });
    // Click edit button for first category
    const editButtons = screen.getAllByText("Edit");
    await userEvent.click(editButtons[0]);
    // Save edited category
    const saveButton = screen.getByText("Save");
    await userEvent.click(saveButton);
    expect(updateCategory).toHaveBeenCalledWith({
      id: "1",
      name: "Test Category",
      description: "Test Description",
    });
  });

  it("handles deleting a category", async () => {
    mockSwrReturnValue = {
      data: mockCategories,
      error: undefined,
      isLoading: false,
    };
    renderWithProviders(<CategoriesPage />);
    await waitFor(() => {
      expect(screen.getByTestId("category-table")).toBeInTheDocument();
    });
    // Click delete button for first category
    const deleteButtons = screen.getAllByText("Delete");
    await userEvent.click(deleteButtons[0]);
    // Confirm deletion (button is the second match)
    const confirmDeleteButtons = screen.getAllByText("Delete Category");
    await userEvent.click(confirmDeleteButtons[1]);
    expect(deleteCategory).toHaveBeenCalledWith({
      id: "1",
      reassignToCategoryId: undefined,
    });
  });

  it("handles quick adding a common category", async () => {
    mockSwrReturnValue = {
      data: mockCategories,
      error: undefined,
      isLoading: false,
    };
    renderWithProviders(<CategoriesPage />);

    const addCommonButton = screen.getByText("Add Common");
    await userEvent.click(addCommonButton);

    expect(createCategory).toHaveBeenCalledWith({
      name: "Common Category",
      budgetAccountId: mockAccount.id,
    });
  });
});
