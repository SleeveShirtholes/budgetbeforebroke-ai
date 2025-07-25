import {
  getDashboardData,
  getAccountBalance,
  getMonthlyIncome,
  getMonthlyExpenses,
} from "../dashboard";

// Mock the database and auth modules
jest.mock("@/db/config", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
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

    // Patch select to always return a chain with groupBy
    mockDb.select.mockImplementation(() => ({
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    }));
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

      // Mock expense calculation
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
    it("should aggregate all dashboard data correctly", async () => {
      // Create a counter to track how many times select is called
      let selectCallCount = 0;

      mockDb.select.mockImplementation(() => {
        selectCallCount++;

        // First call: user lookup for getDefaultBudgetAccountId
        if (selectCallCount === 1) {
          return {
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest
              .fn()
              .mockResolvedValue([{ defaultBudgetAccountId: "account-123" }]),
          };
        }

        // Second call: balance calculation
        if (selectCallCount === 2) {
          return {
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockResolvedValue([
              {
                totalIncome: "5000",
                totalExpenses: "3000",
              },
            ]),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
          };
        }

        // Third call: monthly income
        if (selectCallCount === 3) {
          return {
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockResolvedValue([
              {
                totalIncome: "4200",
              },
            ]),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
          };
        }

        // Fourth call: monthly expenses
        if (selectCallCount === 4) {
          return {
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockResolvedValue([
              {
                totalExpenses: "2800",
              },
            ]),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
          };
        }

        // Remaining calls: monthly spending data (12 months)
        return {
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockResolvedValue([
            // Provide a mock row for each month if needed, or just a single row for simplicity
            { year: 2023, month: 1, totalIncome: 0, totalExpenses: 0 },
          ]),
          limit: jest.fn().mockReturnThis(),
        };
      });

      // Mock budget lookup (no budget found)
      mockDb.query.budgets.findFirst.mockResolvedValue(null);

      const result = await getDashboardData();

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
