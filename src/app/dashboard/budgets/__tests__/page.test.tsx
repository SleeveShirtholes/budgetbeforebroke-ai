import {
  createBudget,
  createBudgetCategory,
  getBudgetCategories,
} from "@/app/actions/budget";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BudgetCategory, BudgetCategoryName } from "../types/budget.types";

import { getCategories } from "@/app/actions/category";
import { useToast } from "@/components/Toast";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import Budget from "../page";

// Mock the hooks and actions
jest.mock("@/components/Toast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/stores/budgetAccountStore", () => ({
  useBudgetAccount: jest.fn(),
}));

jest.mock("@/app/actions/budget", () => ({
  createBudget: jest.fn(),
  createBudgetCategory: jest.fn(),
  deleteBudgetCategory: jest.fn(),
  getBudgetCategories: jest.fn(),
  updateBudget: jest.fn(),
}));

jest.mock("@/app/actions/category", () => ({
  getCategories: jest.fn(),
}));

// Mock CustomSelect to be a simple input for testing
jest.mock("@/components/Forms/CustomSelect", () => ({
  __esModule: true,
  default: ({ value, onChange, ...props }: Record<string, unknown>) => (
    <input
      data-testid="custom-select"
      value={value as string}
      onChange={(e) => {
        if (typeof onChange === "function") {
          onChange((e.target as HTMLInputElement).value);
        }
      }}
      {...props}
    />
  ),
}));

// Mock SWR
type BudgetObj = { id: string; totalBudget?: number };
type SWRData = {
  budgets: { data: BudgetCategory[]; isLoading: boolean };
  budgetId: { data: BudgetObj | null; isLoading: boolean };
  categories: { data: { name: BudgetCategoryName }[]; isLoading: boolean };
};

const mockSWRData: SWRData = {
  budgets: { data: [], isLoading: false },
  budgetId: {
    data: { id: "test-budget-id", totalBudget: 2000 },
    isLoading: false,
  },
  categories: { data: [], isLoading: false },
};

jest.mock("swr", () => ({
  __esModule: true,
  default: (key: [string, ...unknown[]]) => {
    const keyString = key[0] as keyof SWRData;
    return mockSWRData[keyString] || { data: null, isLoading: false };
  },
  mutate: jest.fn(),
}));

describe("Budget Page", () => {
  const mockShowToast = jest.fn();
  const mockSelectedAccount = {
    id: "test-account-id",
    nickname: "Test Account",
  };

  const mockCategories: BudgetCategory[] = [
    {
      id: "1",
      name: "Housing" as BudgetCategoryName,
      amount: 1000,
      color: "#000",
    },
    {
      id: "2",
      name: "Transportation" as BudgetCategoryName,
      amount: 500,
      color: "#fff",
    },
  ];

  const mockAvailableCategories: BudgetCategoryName[] = [
    "Housing",
    "Transportation",
    "Food & Groceries",
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (useBudgetAccount as jest.Mock).mockReturnValue({
      selectedAccount: mockSelectedAccount,
    });
    (createBudget as jest.Mock).mockResolvedValue({
      id: "test-budget-id",
      totalBudget: 2000,
    });
    (getBudgetCategories as jest.Mock).mockResolvedValue(mockCategories);
    (getCategories as jest.Mock).mockResolvedValue(
      mockAvailableCategories.map((name) => ({ name })),
    );

    // Reset SWR mock data
    mockSWRData.budgets = { data: mockCategories, isLoading: false };
    mockSWRData.budgetId = {
      data: { id: "test-budget-id", totalBudget: 5000 },
      isLoading: false,
    };
    mockSWRData.categories = {
      data: mockAvailableCategories.map((name) => ({ name })),
      isLoading: false,
    };
  });

  it("renders the budget page with categories", async () => {
    render(<Budget />);

    // Check if the page title is rendered
    expect(screen.getByText(/Budget for/)).toBeInTheDocument();

    // Check if the budget overview is rendered
    expect(screen.getByText("Total Budget")).toBeInTheDocument();
    expect(screen.getByText("Budgeted Amount")).toBeInTheDocument();
    expect(screen.getByText("Remaining to Budget")).toBeInTheDocument();

    // Check if categories are rendered
    await waitFor(() => {
      expect(screen.getByText("Housing")).toBeInTheDocument();
      expect(screen.getByText("Transportation")).toBeInTheDocument();
    });
  });

  it("shows error toast when trying to add duplicate category", async () => {
    render(<Budget />);

    // Open the add category modal
    const addButton = screen.getByText("Add Category");
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Fill in the form with a duplicate category
    const categorySelect = screen.getByPlaceholderText("Select a category");
    await act(async () => {
      fireEvent.change(categorySelect, { target: { value: "Housing" } });
    });

    const amountInput = screen.getByPlaceholderText("0.00");
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: "500" } });
    });

    // Submit the form
    const form = screen.getByTestId("category-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    // Check that the toast was shown
    expect(mockShowToast).toHaveBeenCalledWith(
      "This category already exists for this month. Please edit the existing category instead.",
      {
        type: "error",
        duration: 5000,
      },
    );

    // Check that the form is still open and populated
    expect(screen.getByDisplayValue("Housing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("500")).toBeInTheDocument();
  });

  it("successfully adds a new category", async () => {
    (createBudgetCategory as jest.Mock).mockResolvedValueOnce({
      id: "new-category-id",
      name: "Food & Groceries" as BudgetCategoryName,
      amount: 300,
      color: "#000",
    });

    render(<Budget />);

    // Open the add category modal
    const addButton = screen.getByText("Add Category");
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Fill in the form with a new category
    const categorySelect = screen.getByPlaceholderText("Select a category");
    await act(async () => {
      fireEvent.change(categorySelect, {
        target: { value: "Food & Groceries" },
      });
    });

    const amountInput = screen.getByPlaceholderText("0.00");
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: "300" } });
    });

    // Submit the form
    const form = screen.getByTestId("category-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    // Check that createBudgetCategory was called with correct parameters
    expect(createBudgetCategory).toHaveBeenCalledWith(
      "test-budget-id",
      "Food & Groceries",
      300,
    );

    // Check that the form is closed
    await waitFor(() => {
      expect(screen.queryByTestId("category-form")).not.toBeInTheDocument();
    });
  });

  it("allows editing and saving the total budget and updates the UI", async () => {
    // Mock updateBudget to resolve
    const updateBudget = jest
      .fn()
      .mockResolvedValue({ id: "test-budget-id", totalBudget: 5000 });
    jest.doMock("@/app/actions/budget", () => ({
      ...jest.requireActual("@/app/actions/budget"),
      updateBudget,
    }));

    render(<Budget />);

    // Click the edit button (pencil icon)
    const editButton = screen.getByTestId("edit-total-budget");
    await act(async () => {
      userEvent.click(editButton);
    });

    // Change the value in the input
    const input = await screen.findByTestId("edit-total-budget-input");
    await act(async () => {
      userEvent.clear(input);
      userEvent.type(input, "5000");
    });

    // Click Save
    const saveButton = screen.getByText("Save");
    await act(async () => {
      userEvent.click(saveButton);
    });

    // Simulate SWR data update after save
    mockSWRData.budgetId = {
      data: { id: "test-budget-id", totalBudget: 5000 },
      isLoading: false,
    };
    mockSWRData.budgets = { data: mockCategories, isLoading: false };
    // Re-render to pick up new SWR data
    render(<Budget />);

    // Wait for the new value to appear in the UI
    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.replace(/\s/g, "").includes("$5,000.00"),
        ),
      ).toBeInTheDocument();
    });
  });
});
