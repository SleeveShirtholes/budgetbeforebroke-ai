import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import { createCategory } from "@/app/actions/category";
import CategoriesOnboardingPage from "../page";

// Mock dependencies
jest.mock("next/navigation");
jest.mock("@/components/Toast");
jest.mock("@/stores/budgetAccountStore");
jest.mock("@/app/actions/category");
jest.mock("../../components/OnboardingProgress", () => {
  return function MockOnboardingProgress() {
    return <div data-testid="onboarding-progress">Onboarding Progress</div>;
  };
});

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockUseBudgetAccount = useBudgetAccount as jest.MockedFunction<
  typeof useBudgetAccount
>;
const mockCreateCategory = createCategory as jest.MockedFunction<
  typeof createCategory
>;

describe("CategoriesOnboardingPage", () => {
  const mockPush = jest.fn();
  const mockShowToast = jest.fn();
  const mockSelectedAccount = {
    id: "test-account-id",
    accountNumber: "123456",
    nickname: "Test Account",
    users: [],
    invitations: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);

    mockUseToast.mockReturnValue({
      showToast: mockShowToast,
      hideToast: jest.fn(),
    });

    mockUseBudgetAccount.mockReturnValue({
      selectedAccount: mockSelectedAccount,
      accounts: [mockSelectedAccount],
      isLoading: false,
      error: null,
      setSelectedAccount: jest.fn(),
      setAccounts: jest.fn(),
      setIsLoading: jest.fn(),
      setError: jest.fn(),
    });

    mockCreateCategory.mockResolvedValue({
      id: "test-category-id",
      name: "Test Category",
      description: undefined,
      transactionCount: 0,
    });

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe("Rendering", () => {
    it("renders the page with correct title and description", () => {
      render(<CategoriesOnboardingPage />);

      expect(
        screen.getByText("Set Up Your Budget Categories"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Choose the categories you want to use/),
      ).toBeInTheDocument();
    });

    it("renders onboarding progress component", () => {
      render(<CategoriesOnboardingPage />);

      expect(screen.getByTestId("onboarding-progress")).toBeInTheDocument();
    });

    it("renders all common categories", () => {
      render(<CategoriesOnboardingPage />);

      expect(screen.getByText("Housing")).toBeInTheDocument();
      expect(screen.getByText("Transportation")).toBeInTheDocument();
      expect(screen.getByText("Food")).toBeInTheDocument();
      expect(screen.getByText("Utilities")).toBeInTheDocument();
      expect(screen.getByText("Insurance")).toBeInTheDocument();
      expect(screen.getByText("Healthcare")).toBeInTheDocument();
      expect(screen.getByText("Savings")).toBeInTheDocument();
      expect(screen.getByText("Personal")).toBeInTheDocument();
      expect(screen.getByText("Entertainment")).toBeInTheDocument();
      expect(screen.getByText("Debt")).toBeInTheDocument();
      expect(screen.getByText("Income")).toBeInTheDocument();
      expect(screen.getByText("Other")).toBeInTheDocument();
    });

    it("shows loading state when accounts are loading", () => {
      mockUseBudgetAccount.mockReturnValue({
        selectedAccount: null,
        accounts: [],
        isLoading: true,
        error: null,
        setSelectedAccount: jest.fn(),
        setAccounts: jest.fn(),
        setIsLoading: jest.fn(),
        setError: jest.fn(),
      });

      render(<CategoriesOnboardingPage />);

      // Should show loading spinner
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Category Selection", () => {
    it("allows selecting categories", () => {
      render(<CategoriesOnboardingPage />);

      const housingButton = screen.getByText("Housing").closest("button");
      expect(housingButton).toBeInTheDocument();

      fireEvent.click(housingButton!);

      // Should show selected state
      expect(housingButton).toHaveClass("border-primary-500");
      expect(screen.getByText("Selected Categories (1)")).toBeInTheDocument();
    });

    it("allows deselecting categories", () => {
      render(<CategoriesOnboardingPage />);

      const housingButton = screen.getByText("Housing").closest("button");
      fireEvent.click(housingButton!);

      // Should be selected
      expect(screen.getByText("Selected Categories (1)")).toBeInTheDocument();

      // Click again to deselect
      fireEvent.click(housingButton!);

      // Should not be selected
      expect(
        screen.queryByText("Selected Categories (1)"),
      ).not.toBeInTheDocument();
    });

    it("shows clear all button when categories are selected", () => {
      render(<CategoriesOnboardingPage />);

      // Select a category
      const housingButton = screen.getByText("Housing").closest("button");
      fireEvent.click(housingButton!);

      expect(screen.getByText("Clear All")).toBeInTheDocument();
    });

    it("clears all selections when clear all is clicked", () => {
      render(<CategoriesOnboardingPage />);

      // Select multiple categories
      const housingButton = screen.getByText("Housing").closest("button");
      const foodButton = screen.getByText("Food").closest("button");

      fireEvent.click(housingButton!);
      fireEvent.click(foodButton!);

      expect(screen.getByText("Selected Categories (2)")).toBeInTheDocument();

      // Click clear all
      fireEvent.click(screen.getByText("Clear All"));

      expect(
        screen.queryByText("Selected Categories (2)"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("navigates back to income page", () => {
      render(<CategoriesOnboardingPage />);

      fireEvent.click(screen.getByText("Back"));

      expect(mockPush).toHaveBeenCalledWith("/onboarding/income");
    });
  });

  describe("Category Creation", () => {
    it("creates selected categories when continue is clicked", async () => {
      render(<CategoriesOnboardingPage />);

      // Select categories
      const housingButton = screen.getByText("Housing").closest("button");
      const foodButton = screen.getByText("Food").closest("button");

      fireEvent.click(housingButton!);
      fireEvent.click(foodButton!);

      // Click continue
      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(mockCreateCategory).toHaveBeenCalledTimes(2);
        expect(mockCreateCategory).toHaveBeenCalledWith({
          name: "Housing",
          budgetAccountId: "test-account-id",
        });
        expect(mockCreateCategory).toHaveBeenCalledWith({
          name: "Food",
          budgetAccountId: "test-account-id",
        });
      });
    });

    it("shows success toast and navigates after successful creation", async () => {
      render(<CategoriesOnboardingPage />);

      // Select a category
      const housingButton = screen.getByText("Housing").closest("button");
      fireEvent.click(housingButton!);

      // Click continue
      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "Categories created successfully!",
          {
            type: "success",
          },
        );
        expect(mockPush).toHaveBeenCalledWith("/onboarding/bills");
      });
    });

    it("shows error toast when category creation fails", async () => {
      mockCreateCategory.mockRejectedValue(new Error("Creation failed"));

      render(<CategoriesOnboardingPage />);

      // Select a category
      const housingButton = screen.getByText("Housing").closest("button");
      fireEvent.click(housingButton!);

      // Click continue
      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "Failed to create some categories. Please try again.",
          { type: "error" },
        );
      });
    });

    it("disables continue button when no categories are selected", () => {
      render(<CategoriesOnboardingPage />);

      const continueButton = screen.getByText("Continue");
      expect(continueButton).toBeDisabled();
    });

    it("shows loading state during category creation", async () => {
      // Mock a delayed response
      mockCreateCategory.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  id: "test-category-id",
                  name: "Test Category",
                  description: undefined,
                  transactionCount: 0,
                }),
              100,
            ),
          ),
      );

      render(<CategoriesOnboardingPage />);

      // Select a category
      const housingButton = screen.getByText("Housing").closest("button");
      fireEvent.click(housingButton!);

      // Click continue
      fireEvent.click(screen.getByText("Continue"));

      // Should show loading state
      expect(screen.getByText("Creating...")).toBeInTheDocument();
    });
  });

  describe("Custom Categories", () => {
    it("shows add custom category button", () => {
      render(<CategoriesOnboardingPage />);

      expect(screen.getByText("Add Custom Category")).toBeInTheDocument();
    });

    it("shows custom category form when add button is clicked", () => {
      render(<CategoriesOnboardingPage />);

      fireEvent.click(screen.getByText("Add Custom Category"));

      expect(screen.getByText("Custom Category Name")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("e.g., Gym Membership, Coffee, etc."),
      ).toBeInTheDocument();
      expect(screen.getByText("Add")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("adds custom category when form is submitted", () => {
      render(<CategoriesOnboardingPage />);

      // Open custom category form
      fireEvent.click(screen.getByText("Add Custom Category"));

      // Enter custom category name
      const input = screen.getByPlaceholderText(
        "e.g., Gym Membership, Coffee, etc.",
      );
      fireEvent.change(input, { target: { value: "Gym Membership" } });

      // Submit form
      fireEvent.click(screen.getByText("Add"));

      // Should show success toast
      expect(mockShowToast).toHaveBeenCalledWith("Custom category added!", {
        type: "success",
      });

      // Should show custom category in list
      expect(screen.getByText("Gym Membership")).toBeInTheDocument();
    });

    it("prevents adding duplicate custom categories", () => {
      render(<CategoriesOnboardingPage />);

      // Add first custom category
      fireEvent.click(screen.getByText("Add Custom Category"));
      const input = screen.getByPlaceholderText(
        "e.g., Gym Membership, Coffee, etc.",
      );
      fireEvent.change(input, { target: { value: "Gym Membership" } });
      fireEvent.click(screen.getByText("Add"));

      // Clear the mock to check the next call
      mockShowToast.mockClear();

      // Try to add same category again
      fireEvent.click(screen.getByText("Add Custom Category"));
      const input2 = screen.getByPlaceholderText(
        "e.g., Gym Membership, Coffee, etc.",
      );
      fireEvent.change(input2, { target: { value: "Gym Membership" } });
      fireEvent.click(screen.getByText("Add"));

      expect(mockShowToast).toHaveBeenCalledWith(
        "This category already exists.",
        { type: "error" },
      );
    });

    it("prevents adding common categories as custom", () => {
      render(<CategoriesOnboardingPage />);

      fireEvent.click(screen.getByText("Add Custom Category"));
      const input = screen.getByPlaceholderText(
        "e.g., Gym Membership, Coffee, etc.",
      );
      fireEvent.change(input, { target: { value: "Housing" } });
      fireEvent.click(screen.getByText("Add"));

      expect(mockShowToast).toHaveBeenCalledWith(
        "This is already a common category. Please select it from the list above.",
        { type: "error" },
      );
    });

    it("removes custom category when X is clicked", () => {
      render(<CategoriesOnboardingPage />);

      // Add custom category
      fireEvent.click(screen.getByText("Add Custom Category"));
      const input = screen.getByPlaceholderText(
        "e.g., Gym Membership, Coffee, etc.",
      );
      fireEvent.change(input, { target: { value: "Gym Membership" } });
      fireEvent.click(screen.getByText("Add"));

      // Remove custom category
      const removeButton = screen
        .getByText("Gym Membership")
        .closest("div")
        ?.querySelector("button");
      fireEvent.click(removeButton!);

      // Should not show custom category anymore
      expect(screen.queryByText("Gym Membership")).not.toBeInTheDocument();
    });

    it("cancels custom category form", () => {
      render(<CategoriesOnboardingPage />);

      fireEvent.click(screen.getByText("Add Custom Category"));
      const input = screen.getByPlaceholderText(
        "e.g., Gym Membership, Coffee, etc.",
      );
      fireEvent.change(input, { target: { value: "Gym Membership" } });

      fireEvent.click(screen.getByText("Cancel"));

      // Form should be hidden
      expect(
        screen.queryByText("Custom Category Name"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Add Custom Category")).toBeInTheDocument();
    });

    it("submits form on Enter key", () => {
      render(<CategoriesOnboardingPage />);

      fireEvent.click(screen.getByText("Add Custom Category"));
      const input = screen.getByPlaceholderText(
        "e.g., Gym Membership, Coffee, etc.",
      );
      fireEvent.change(input, { target: { value: "Gym Membership" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

      expect(mockShowToast).toHaveBeenCalledWith("Custom category added!", {
        type: "success",
      });
    });
  });

  describe("localStorage Integration", () => {
    it("loads previously selected categories from localStorage", () => {
      const mockGetItem = jest
        .fn()
        .mockReturnValueOnce(JSON.stringify(["Housing", "Food"]))
        .mockReturnValueOnce(JSON.stringify(["Gym Membership"]));
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: mockGetItem,
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      render(<CategoriesOnboardingPage />);

      // Should show categories as selected
      expect(screen.getByText("Selected Categories (2)")).toBeInTheDocument();
      expect(screen.getByText("Gym Membership")).toBeInTheDocument();
    });

    it("saves selected categories to localStorage", () => {
      const mockSetItem = jest.fn();
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(),
          setItem: mockSetItem,
          removeItem: jest.fn(),
        },
        writable: true,
      });

      render(<CategoriesOnboardingPage />);

      // Select a category
      const housingButton = screen.getByText("Housing").closest("button");
      fireEvent.click(housingButton!);

      expect(mockSetItem).toHaveBeenCalledWith(
        "onboardingCategories",
        JSON.stringify(["Housing"]),
      );
    });

    it("saves custom categories to localStorage", () => {
      const mockSetItem = jest.fn();
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(),
          setItem: mockSetItem,
          removeItem: jest.fn(),
        },
        writable: true,
      });

      render(<CategoriesOnboardingPage />);

      // Add custom category
      fireEvent.click(screen.getByText("Add Custom Category"));
      const input = screen.getByPlaceholderText(
        "e.g., Gym Membership, Coffee, etc.",
      );
      fireEvent.change(input, { target: { value: "Gym Membership" } });
      fireEvent.click(screen.getByText("Add"));

      expect(mockSetItem).toHaveBeenCalledWith(
        "onboardingCustomCategories",
        JSON.stringify(["Gym Membership"]),
      );
    });
  });
});
