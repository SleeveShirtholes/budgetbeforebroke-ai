import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDebts } from "@/hooks/useDebts";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import { ToastProvider } from "@/components/Toast";
import DebtsPage from "../page";

// Mock the useDebts hook
jest.mock("@/hooks/useDebts");
const mockUseDebts = useDebts as jest.MockedFunction<typeof useDebts>;

// Mock the useBudgetAccount hook
jest.mock("@/stores/budgetAccountStore");
const mockUseBudgetAccount = useBudgetAccount as jest.MockedFunction<
  typeof useBudgetAccount
>;

// Mock SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
  mutate: jest.fn(),
}));

describe("DebtsPage", () => {
  const mockDebts = [
    {
      id: "1",
      budgetAccountId: "account1",
      createdByUserId: "user1",
      name: "Car Loan",
      paymentAmount: 15000,
      interestRate: 4.5,
      dueDate: "2025-05-07",
      hasBalance: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      payments: [
        {
          id: "p1",
          debtId: "1",
          amount: 300,
          date: "2024-05-01",
          note: "Monthly payment",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
  ];

  const mockAccount = {
    id: "account1",
    accountNumber: "1234567890",
    nickname: "Test Account",
    users: [
      {
        id: "user1",
        email: "test@example.com",
        name: "Test User",
        role: "owner" as const,
        avatar: undefined,
        accepted: true,
      },
    ],
    invitations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUseDebtsReturn = {
    debts: mockDebts,
    error: null,
    isLoading: false,
    addDebt: jest.fn().mockResolvedValue({ success: true }),
    updateDebtById: jest.fn().mockResolvedValue({ success: true }),
    removeDebt: jest.fn().mockResolvedValue({ success: true }),
    addPayment: jest.fn().mockResolvedValue({ success: true }),
    mutateDebts: jest.fn(),
  };

  const mockUseBudgetAccountReturn = {
    selectedAccount: mockAccount,
    accounts: [mockAccount],
    isLoading: false,
    error: null,
    setSelectedAccount: jest.fn(),
    setAccounts: jest.fn(),
    setIsLoading: jest.fn(),
    setError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDebts.mockReturnValue(mockUseDebtsReturn);
    mockUseBudgetAccount.mockReturnValue(mockUseBudgetAccountReturn);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<ToastProvider>{component}</ToastProvider>);
  };

  it("renders the page with debts", async () => {
    renderWithProviders(<DebtsPage />);

    await waitFor(() => {
      expect(screen.getByText("Car Loan")).toBeInTheDocument();
      expect(screen.getByText("$15,000")).toBeInTheDocument();
      expect(screen.getByText("4.5%")).toBeInTheDocument();
    });
  });

  it("shows loading state", () => {
    mockUseBudgetAccount.mockReturnValue({
      ...mockUseBudgetAccountReturn,
      isLoading: true,
    });

    renderWithProviders(<DebtsPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockUseDebts.mockReturnValue({
      ...mockUseDebtsReturn,
      error: new Error("Failed to load"),
    });

    renderWithProviders(<DebtsPage />);
    expect(
      screen.getByText("Error loading debts. Please try again."),
    ).toBeInTheDocument();
  });

  it("shows empty state when no debts", () => {
    mockUseDebts.mockReturnValue({
      ...mockUseDebtsReturn,
      debts: [],
    });

    renderWithProviders(<DebtsPage />);
    expect(screen.getByText("No debts found")).toBeInTheDocument();
  });

  it("filters debts based on search", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DebtsPage />);

    const searchInput = screen.getByPlaceholderText("Search debts...");
    await user.type(searchInput, "Car");

    await waitFor(() => {
      // The text is highlighted and split into spans, so we need to check for the content
      const elements = screen.getAllByText((content, element) => {
        return element?.textContent === "Car Loan";
      });
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("opens add modal when Add Debt button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DebtsPage />);

    const addButton = screen.getByText("Add Debt");
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Add New Debt")).toBeInTheDocument();
    });
  });

  it("opens edit modal when edit button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DebtsPage />);

    const editButton = screen.getByLabelText("Edit Debt");
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit Debt")).toBeInTheDocument();
    });
  });

  it("opens delete modal when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DebtsPage />);

    const deleteButton = screen.getByLabelText("Delete Debt");
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Delete Debt")).toBeInTheDocument();
    });
  });

  it("opens pay modal when pay button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DebtsPage />);

    const payButton = screen.getByText("Record Payment");
    await user.click(payButton);

    await waitFor(() => {
      expect(screen.getByText("Pay Debt")).toBeInTheDocument();
    });
  });
});
