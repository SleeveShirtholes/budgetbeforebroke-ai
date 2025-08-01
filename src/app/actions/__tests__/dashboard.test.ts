import {
  getDashboardData,
  getAccountBalance,
  getMonthlyIncome,
  getMonthlyExpenses,
} from "../dashboard";

// Mock the database and auth modules
jest.mock("@/db/config", () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    innerJoin: jest.fn(),
    leftJoin: jest.fn(),
    groupBy: jest.fn(),
    orderBy: jest.fn(),
    query: {
      budgets: {
        findFirst: jest.fn(),
      },
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
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest
          .fn()
          .mockResolvedValue([{ defaultBudgetAccountId: "account-123" }]),
      });

      // Mock balance calculation
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([
          {
            totalIncome: "5000",
            totalExpenses: "3000",
          },
        ]),
      });

      const balance = await getAccountBalance();
      expect(balance).toBe(2000);
    });

    it("should handle missing user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(getAccountBalance()).rejects.toThrow("Not authenticated");
    });

    it("should handle missing default budget account", async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{}]),
      });

      await expect(getAccountBalance()).rejects.toThrow(
        "No default budget account found",
      );
    });
  });

  describe("getMonthlyIncome", () => {
    it("should calculate monthly income correctly", async () => {
      // Mock user lookup
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest
          .fn()
          .mockResolvedValue([{ defaultBudgetAccountId: "account-123" }]),
      });

      // Mock income calculation
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([
          {
            totalIncome: "4200",
          },
        ]),
      });

      const income = await getMonthlyIncome();
      expect(income).toBe(4200);
    });
  });

  describe("getMonthlyExpenses", () => {
    it("should calculate monthly expenses correctly", async () => {
      // Mock user lookup
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest
          .fn()
          .mockResolvedValue([{ defaultBudgetAccountId: "account-123" }]),
      });

      // Mock expenses calculation
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([
          {
            totalExpenses: "2800",
          },
        ]),
      });

      const expenses = await getMonthlyExpenses();
      expect(expenses).toBe(2800);
    });
  });

  describe("getDashboardData", () => {
    // TODO: Fix the orderBy mock chain issue
    it.skip("should aggregate all dashboard data correctly", async () => {
      // Mock getDefaultBudgetAccountId
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest
          .fn()
          .mockResolvedValue([{ defaultBudgetAccountId: "account-123" }]),
      });

      // Mock getAccountBalance
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest
          .fn()
          .mockResolvedValue([{ totalIncome: "5000", totalExpenses: "3000" }]),
      });

      // Mock getMonthlyIncome
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ totalIncome: "4200" }]),
      });

      // Mock getMonthlyExpenses
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ totalExpenses: "2800" }]),
      });

      // Mock getMonthlySpendingData - use a simpler approach
      const mockOrderBy = jest.fn().mockResolvedValue([
        {
          id: "tx-1",
          amount: "100",
          type: "expense",
          date: new Date("2023-01-15"),
        },
        {
          id: "tx-2",
          amount: "200",
          type: "income",
          date: new Date("2023-01-20"),
        },
      ]);

      // Create a mock object that has all the chain methods
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: mockOrderBy,
      };

      mockDb.select.mockReturnValueOnce(mockChain);

      // Mock getBudgetCategoriesWithSpending (groupBy)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockResolvedValue([]),
      });

      // Mock budget lookup (no budget found)
      mockDb.query.budgets.findFirst.mockResolvedValue(null);

      // Build expected monthlySpendingData for 12 months with amount: 0
      const now = new Date();
      const expectedMonthlySpendingData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        expectedMonthlySpendingData.push({
          month: date.toLocaleDateString("en-US", { month: "short" }),
          amount: 0,
        });
      }

      const result = await getDashboardData();

      expect(result).toEqual({
        totalBalance: 2000,
        monthlyIncome: 4200,
        monthlyExpenses: 2800,
        monthlySpendingData: expectedMonthlySpendingData,
        budgetCategories: [],
      });
    });
  });
});
