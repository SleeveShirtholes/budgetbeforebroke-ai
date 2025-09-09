import {
  getDashboardData,
  getAccountBalance,
  getMonthlyIncome,
  getMonthlyExpenses,
} from "../dashboard";

// Mock the database and auth modules
jest.mock("@/db/config", () => ({
  db: {
    user: {
      findFirst: jest.fn(),
    },
    transaction: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    budget: {
      findFirst: jest.fn(),
    },
    budgetCategory: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

describe("Dashboard Actions", () => {
  const mockDb = jest.requireMock("@/db/config").db;
  const mockAuth = jest.requireMock("@/lib/auth").auth;
  const mockHeaders = jest.requireMock("next/headers").headers;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authenticated session
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    mockHeaders.mockResolvedValue({});
  });

  describe("getAccountBalance", () => {
    it("should calculate balance correctly", async () => {
      // Mock user lookup
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: "account-123",
      });

      // Mock income calculation
      mockDb.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 5000 } }) // income
        .mockResolvedValueOnce({ _sum: { amount: 3000 } }); // expenses

      const balance = await getAccountBalance();
      expect(balance).toBe(2000);
    });

    it("should handle missing user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(getAccountBalance()).rejects.toThrow("Not authenticated");
    });

    it("should handle missing default budget account", async () => {
      mockDb.user.findFirst.mockResolvedValue({});

      await expect(getAccountBalance()).rejects.toThrow(
        "No default budget account found",
      );
    });
  });

  describe("getMonthlyIncome", () => {
    it("should calculate monthly income correctly", async () => {
      // Mock user lookup
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: "account-123",
      });

      // Mock budget lookup
      mockDb.budget.findFirst.mockResolvedValue({
        id: "budget-123",
        year: 2024,
        month: 1,
      });

      // Mock income calculation
      mockDb.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 4200 },
      });

      const income = await getMonthlyIncome();
      expect(income).toBe(4200);
    });
  });

  describe("getMonthlyExpenses", () => {
    it("should calculate monthly expenses correctly", async () => {
      // Mock user lookup
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: "account-123",
      });

      // Mock budget lookup
      mockDb.budget.findFirst.mockResolvedValue({
        id: "budget-123",
        year: 2024,
        month: 1,
      });

      // Mock expenses calculation
      mockDb.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 2800 },
      });

      const expenses = await getMonthlyExpenses();
      expect(expenses).toBe(2800);
    });
  });

  describe("getDashboardData", () => {
    it("should return complete dashboard data", async () => {
      // Mock user lookup
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: "account-123",
      });

      // Mock budget lookup
      mockDb.budget.findFirst.mockResolvedValue({
        id: "budget-123",
        year: 2024,
        month: 1,
      });

      // Mock transaction aggregates
      mockDb.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 5000 } }) // income
        .mockResolvedValueOnce({ _sum: { amount: 3000 } }) // expenses
        .mockResolvedValueOnce({ _sum: { amount: 4200 } }) // monthly income
        .mockResolvedValueOnce({ _sum: { amount: 2800 } }); // monthly expenses

      // Mock budget categories
      mockDb.budgetCategory.findMany.mockResolvedValue([
        {
          id: "bc-1",
          amount: 1000,
          category: {
            name: "Groceries",
            color: "rgb(78, 0, 142)",
          },
        },
      ]);

      // Mock category spending
      mockDb.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 800 },
      });

      // Mock monthly spending data
      mockDb.transaction.findMany.mockResolvedValue([
        {
          id: "tx-1",
          amount: 100,
          type: "expense",
          date: new Date("2024-01-15"),
          description: "Test expense",
        },
      ]);

      const dashboardData = await getDashboardData();

      expect(dashboardData).toHaveProperty("totalBalance");
      expect(dashboardData).toHaveProperty("monthlyIncome");
      expect(dashboardData).toHaveProperty("monthlyExpenses");
      expect(dashboardData).toHaveProperty("budgetCategories");
      expect(dashboardData).toHaveProperty("monthlySpendingData");
    });
  });
});
