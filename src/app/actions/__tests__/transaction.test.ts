import {
  createTransaction,
  deleteTransaction,
  getTransactionCategories,
  getTransactions,
  updateTransaction,
  updateTransactionCategory,
  type CreateTransactionInput,
  type UpdateTransactionInput,
  type Transaction,
} from "../transaction";

import { db as importedDb } from "@/db/config";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Get the mocked db
const mockDb = importedDb as jest.Mocked<typeof importedDb>;

// Mock the dependencies
jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock("@/db/config", () => ({
  db: {
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    budgetAccount: {
      findFirst: jest.fn(),
    },
    // Add Drizzle-style methods that the test is trying to use
    select: jest.fn(),
    from: jest.fn(),
    leftJoin: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    insert: jest.fn(),
    values: jest.fn(),
    update: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

jest.mock("crypto", () => ({
  randomUUID: jest.fn(() => "mock-transaction-id"),
}));

describe("Transaction Actions", () => {
  const mockUserId = "user-123";
  const mockAccountId = "account-123";
  const mockCategoryId = "category-123";
  const mockTransactionId = "transaction-123";
  const mockSession = {
    user: { id: mockUserId },
  };

  const mockTransaction: Transaction = {
    id: mockTransactionId,
    budgetAccountId: mockAccountId,
    categoryId: mockCategoryId,
    createdByUserId: mockUserId,
    amount: 100.5,
    description: "Test transaction",
    date: new Date("2024-01-01"),
    type: "expense",
    status: "completed",
    merchantName: "Test Merchant",
    plaidCategory: null,
    pending: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    categoryName: "Test Category",
  };

  const mockCategory = {
    id: mockCategoryId,
    name: "Test Category",
    description: "Test Description",
    color: "#FF0000",
    icon: "test-icon",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth.api.getSession as jest.Mock).mockResolvedValue(mockSession);
    (headers as jest.Mock).mockResolvedValue({});

    // Reset all Prisma db mocks
    Object.values(mockDb).forEach((model) => {
      if (typeof model === "object" && model !== null) {
        Object.values(model as Record<string, unknown>).forEach((fn) => {
          if (typeof fn === "function" && "mockClear" in fn) {
            (fn as { mockClear: () => void }).mockClear();
          }
        });
      }
    });
  });

  describe("getTransactions", () => {
    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(getTransactions()).rejects.toThrow("Not authenticated");
    });

    it("should return transactions with category names", async () => {
      // Mock the user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });

      const mockTransactions = [
        {
          ...mockTransaction,
          category: {
            name: "Test Category",
          },
        },
      ];
      mockDb.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await getTransactions();

      expect(result).toEqual([
        {
          id: mockTransactionId,
          budgetAccountId: mockAccountId,
          categoryId: mockCategoryId,
          createdByUserId: mockUserId,
          amount: 100.5,
          description: "Test transaction",
          date: "2024-01-01", // Converted to string
          type: "expense",
          status: "completed",
          merchantName: "Test Merchant",
          plaidCategory: null,
          pending: false,
          createdAt: mockTransaction.createdAt,
          updatedAt: mockTransaction.updatedAt,
          categoryName: "Test Category", // Added from category relation
        },
      ]);
      expect(mockDb.user.findFirst).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { defaultBudgetAccountId: true },
      });
      expect(mockDb.transaction.findMany).toHaveBeenCalledWith({
        where: { budgetAccountId: mockAccountId },
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: { date: "desc" },
      });
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";
      const mockTransactions = [
        {
          ...mockTransaction,
          category: { name: "Test Category" },
        },
      ];

      // Mock the Prisma method that the function actually uses
      mockDb.transaction.findMany.mockResolvedValue(mockTransactions);

      await getTransactions(customAccountId);

      expect(mockDb.transaction.findMany).toHaveBeenCalledWith({
        where: { budgetAccountId: customAccountId },
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: { date: "desc" },
      });
    });

    it("should convert amount to number", async () => {
      // Mock the user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });

      const mockTransactionsWithStringAmount = [
        {
          ...mockTransaction,
          amount: "100.50", // String amount to be converted
          category: { name: "Test Category" },
        },
      ];
      mockDb.transaction.findMany.mockResolvedValue(
        mockTransactionsWithStringAmount,
      );

      const result = await getTransactions();

      expect(result[0].amount).toBe(100.5);
    });
  });

  describe("getTransactionCategories", () => {
    it("should return categories for budget account", async () => {
      // Mock the user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });

      const mockCategories = [mockCategory];
      mockDb.category.findMany.mockResolvedValue(mockCategories);

      const result = await getTransactionCategories();

      expect(result).toEqual(mockCategories);
      expect(mockDb.category.findMany).toHaveBeenCalledWith({
        where: { budgetAccountId: mockAccountId },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          icon: true,
        },
        orderBy: { name: "asc" },
      });
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";
      const mockCategories = [mockCategory];
      mockDb.category.findMany.mockResolvedValue(mockCategories);

      await getTransactionCategories(customAccountId);

      expect(mockDb.category.findMany).toHaveBeenCalledWith({
        where: { budgetAccountId: customAccountId },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          icon: true,
        },
        orderBy: { name: "asc" },
      });
    });

    it("should convert null values to undefined", async () => {
      // Mock the user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });

      const mockCategoriesWithNulls = [
        {
          ...mockCategory,
          description: null,
          color: null,
          icon: null,
        },
      ];
      mockDb.category.findMany.mockResolvedValue(mockCategoriesWithNulls);

      const result = await getTransactionCategories();

      expect(result[0].description).toBeUndefined();
      expect(result[0].color).toBeUndefined();
      expect(result[0].icon).toBeUndefined();
    });
  });

  describe("createTransaction", () => {
    const createTransactionData: CreateTransactionInput = {
      amount: 100.5,
      description: "Test transaction",
      date: "2024-01-01",
      type: "expense",
      categoryId: mockCategoryId,
      merchantName: "Test Merchant",
    };

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(createTransaction(createTransactionData)).rejects.toThrow(
        "Not authenticated",
      );
    });

    it("should throw error if budget account not found", async () => {
      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock budget account query to return no account
      mockDb.budgetAccount.findFirst.mockResolvedValue(null);

      await expect(createTransaction(createTransactionData)).rejects.toThrow(
        "Budget account not found",
      );
    });

    it("should throw error if category not found", async () => {
      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock budget account query to return account
      mockDb.budgetAccount.findFirst.mockResolvedValue({ id: mockAccountId });
      // Mock category query to return no category
      mockDb.category.findFirst.mockResolvedValue(null);

      await expect(createTransaction(createTransactionData)).rejects.toThrow(
        "Category not found",
      );
    });

    it("should create transaction successfully", async () => {
      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock budget account query to return account
      mockDb.budgetAccount.findFirst.mockResolvedValue({ id: mockAccountId });
      // Mock category query to return category
      mockDb.category.findFirst.mockResolvedValue(mockCategory);
      // Mock transaction creation
      mockDb.transaction.create.mockResolvedValue({
        id: "mock-transaction-id",
        ...createTransactionData,
      });

      const result = await createTransaction(createTransactionData);

      expect(result).toEqual({ id: "mock-transaction-id" });
      expect(mockDb.transaction.create).toHaveBeenCalledWith({
        data: {
          id: "mock-transaction-id",
          budgetAccountId: mockAccountId,
          categoryId: mockCategoryId,
          createdByUserId: mockUserId,
          amount: 100.5,
          description: "Test transaction",
          date: new Date("2024-01-01"),
          type: "expense",
          status: "completed",
          merchantName: "Test Merchant",
        },
      });
    });

    it("should create transaction without optional fields", async () => {
      const minimalData: CreateTransactionInput = {
        amount: 100.5,
        date: "2024-01-01",
        type: "income",
      };

      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock budget account query to return account
      mockDb.budgetAccount.findFirst.mockResolvedValue({ id: mockAccountId });
      // Mock transaction creation
      mockDb.transaction.create.mockResolvedValue({
        id: "mock-transaction-id",
        ...minimalData,
      });

      const result = await createTransaction(minimalData);

      expect(result).toEqual({ id: "mock-transaction-id" });
      expect(mockDb.transaction.create).toHaveBeenCalledWith({
        data: {
          id: "mock-transaction-id",
          budgetAccountId: mockAccountId,
          categoryId: null,
          createdByUserId: mockUserId,
          amount: 100.5,
          description: null,
          date: new Date("2024-01-01"),
          type: "income",
          status: "completed",
          merchantName: null,
        },
      });
    });
  });

  describe("updateTransaction", () => {
    const updateTransactionData: UpdateTransactionInput = {
      id: mockTransactionId,
      amount: 200.75,
      description: "Updated transaction",
      categoryId: mockCategoryId,
    };

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(updateTransaction(updateTransactionData)).rejects.toThrow(
        "Not authenticated",
      );
    });

    it("should throw error if transaction not found", async () => {
      // Mock user query to return default budget account
      mockDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock transaction query to return no transaction
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(updateTransaction(updateTransactionData)).rejects.toThrow(
        "Transaction not found",
      );
    });

    it("should throw error if category not found", async () => {
      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock transaction query to return transaction
      mockDb.transaction.findFirst.mockResolvedValue(mockTransaction);
      // Mock category query to return no category
      mockDb.category.findFirst.mockResolvedValue(null);

      await expect(updateTransaction(updateTransactionData)).rejects.toThrow(
        "Category not found",
      );
    });

    it("should update transaction successfully", async () => {
      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock transaction query to return transaction
      mockDb.transaction.findFirst.mockResolvedValue(mockTransaction);
      // Mock category query to return category
      mockDb.category.findFirst.mockResolvedValue(mockCategory);
      // Mock transaction update
      mockDb.transaction.update.mockResolvedValue({
        id: mockTransactionId,
        ...updateTransactionData,
      });

      const result = await updateTransaction(updateTransactionData);

      expect(result).toEqual({ id: mockTransactionId });
      expect(mockDb.transaction.update).toHaveBeenCalledWith({
        where: { id: mockTransactionId },
        data: {
          amount: 200.75,
          description: "Updated transaction",
          categoryId: mockCategoryId,
        },
      });
    });

    it("should update only provided fields", async () => {
      const partialUpdate: UpdateTransactionInput = {
        id: mockTransactionId,
        amount: 150.25,
      };

      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock transaction query to return transaction
      mockDb.transaction.findFirst.mockResolvedValue(mockTransaction);
      // Mock transaction update
      mockDb.transaction.update.mockResolvedValue({
        id: mockTransactionId,
        ...partialUpdate,
      });

      const result = await updateTransaction(partialUpdate);

      expect(result).toEqual({ id: mockTransactionId });
      expect(mockDb.transaction.update).toHaveBeenCalledWith({
        where: { id: mockTransactionId },
        data: {
          amount: 150.25,
        },
      });
    });

    it("should handle date updates", async () => {
      const dateUpdate: UpdateTransactionInput = {
        id: mockTransactionId,
        date: "2024-02-01",
      };

      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock transaction query to return transaction
      mockDb.transaction.findFirst.mockResolvedValue(mockTransaction);
      // Mock transaction update
      mockDb.transaction.update.mockResolvedValue({
        id: mockTransactionId,
        ...dateUpdate,
      });

      const result = await updateTransaction(dateUpdate);

      expect(result).toEqual({ id: mockTransactionId });
      expect(mockDb.transaction.update).toHaveBeenCalledWith({
        where: { id: mockTransactionId },
        data: {
          date: new Date("2024-02-01"),
        },
      });
    });

    it("should handle date format correctly to avoid timezone issues", async () => {
      // Test the specific case mentioned by the user: 7/31 being saved as 7/1
      const dateUpdate: UpdateTransactionInput = {
        id: mockTransactionId,
        date: "2024-07-31", // July 31st
      };

      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock transaction query to return transaction
      mockDb.transaction.findFirst.mockResolvedValue(mockTransaction);
      // Mock transaction update
      mockDb.transaction.update.mockResolvedValue({
        id: mockTransactionId,
        ...dateUpdate,
      });

      const result = await updateTransaction(dateUpdate);

      expect(result).toEqual({ id: mockTransactionId });
      // Verify that the date is correctly parsed as July 31st, not July 1st
      expect(mockDb.transaction.update).toHaveBeenCalledWith({
        where: { id: mockTransactionId },
        data: {
          date: new Date("2024-07-31"),
        },
      });
    });
  });

  describe("updateTransactionCategory", () => {
    it("should throw error if category not found", async () => {
      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock category query to return no category
      mockDb.category.findFirst.mockResolvedValue(null);

      await expect(
        updateTransactionCategory(mockTransactionId, mockCategoryId),
      ).rejects.toThrow("Category not found");
    });

    it("should update transaction category successfully", async () => {
      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock category query to return category
      mockDb.category.findFirst.mockResolvedValue(mockCategory);
      // Mock transaction update
      mockDb.transaction.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await updateTransactionCategory(
        mockTransactionId,
        mockCategoryId,
      );

      expect(result).toEqual({ id: mockTransactionId });
      expect(mockDb.transaction.updateMany).toHaveBeenCalledWith({
        where: {
          id: mockTransactionId,
          budgetAccountId: mockAccountId,
        },
        data: {
          categoryId: mockCategoryId,
        },
      });
    });

    it("should allow removing category (setting to null)", async () => {
      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock transaction update
      mockDb.transaction.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await updateTransactionCategory(mockTransactionId, null);

      expect(result).toEqual({ id: mockTransactionId });
      expect(mockDb.transaction.updateMany).toHaveBeenCalledWith({
        where: {
          id: mockTransactionId,
          budgetAccountId: mockAccountId,
        },
        data: {
          categoryId: null,
        },
      });
    });
  });

  describe("deleteTransaction", () => {
    it("should delete transaction successfully", async () => {
      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });

      // Mock transaction deletion
      mockDb.transaction.deleteMany.mockResolvedValue({
        count: 1,
      });

      const result = await deleteTransaction(mockTransactionId);

      expect(result).toEqual({ id: mockTransactionId });
      expect(mockDb.transaction.deleteMany).toHaveBeenCalledWith({
        where: {
          id: mockTransactionId,
          budgetAccountId: mockAccountId,
        },
      });
    });

    it("should use correct budget account ID for deletion", async () => {
      // Mock user query to return default budget account
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      // Mock transaction deletion
      mockDb.transaction.deleteMany.mockResolvedValue({
        count: 1,
      });

      const result = await deleteTransaction(mockTransactionId);

      expect(result).toEqual({ id: mockTransactionId });
      expect(mockDb.transaction.deleteMany).toHaveBeenCalledWith({
        where: {
          id: mockTransactionId,
          budgetAccountId: mockAccountId,
        },
      });
    });
  });

  describe("getDefaultBudgetAccountId (internal function)", () => {
    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      // This will be tested indirectly through other functions
      await expect(getTransactions()).rejects.toThrow("Not authenticated");
    });

    it("should throw error if no default budget account found", async () => {
      mockDb.user.findFirst.mockResolvedValue(null); // No user found

      await expect(getTransactions()).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should return default budget account ID", async () => {
      mockDb.user.findFirst.mockResolvedValue({
        defaultBudgetAccountId: mockAccountId,
      });
      mockDb.transaction.findMany.mockResolvedValue([]);

      const result = await getTransactions();

      expect(result).toEqual([]);
      expect(mockDb.transaction.findMany).toHaveBeenCalled();
    });
  });
});
