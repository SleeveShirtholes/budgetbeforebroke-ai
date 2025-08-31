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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const actualDb = importedDb as any;

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
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
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
    date: "2024-01-01",
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

    // Reset all db mocks
    Object.values(actualDb).forEach((fn: unknown) => {
      if (typeof fn === "function" && "mockClear" in fn) {
        (fn as jest.Mock).mockClear();
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
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      const mockTransactions = [mockTransaction];
      actualDb.orderBy.mockResolvedValueOnce(mockTransactions);

      const result = await getTransactions();

      expect(result).toEqual(mockTransactions);
      expect(actualDb.select).toHaveBeenCalled();
      expect(actualDb.leftJoin).toHaveBeenCalled();
      expect(actualDb.orderBy).toHaveBeenCalled();
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";
      const mockTransactions = [mockTransaction];
      actualDb.orderBy.mockResolvedValueOnce(mockTransactions);

      await getTransactions(customAccountId);

      expect(actualDb.where).toHaveBeenCalled();
    });

    it("should convert amount to number", async () => {
      // Mock the user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      const mockTransactionsWithStringAmount = [
        { ...mockTransaction, amount: "100.50" },
      ];
      actualDb.orderBy.mockResolvedValueOnce(mockTransactionsWithStringAmount);

      const result = await getTransactions();

      expect(result[0].amount).toBe(100.5);
    });
  });

  describe("getTransactionCategories", () => {
    it("should return categories for budget account", async () => {
      // Mock the user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      const mockCategories = [mockCategory];
      actualDb.orderBy.mockResolvedValueOnce(mockCategories);

      const result = await getTransactionCategories();

      expect(result).toEqual(mockCategories);
      expect(actualDb.select).toHaveBeenCalled();
      expect(actualDb.orderBy).toHaveBeenCalled();
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";
      const mockCategories = [mockCategory];
      actualDb.orderBy.mockResolvedValueOnce(mockCategories);

      await getTransactionCategories(customAccountId);

      expect(actualDb.where).toHaveBeenCalled();
    });

    it("should convert null values to undefined", async () => {
      // Mock the user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      const mockCategoriesWithNulls = [
        {
          ...mockCategory,
          description: null,
          color: null,
          icon: null,
        },
      ];
      actualDb.orderBy.mockResolvedValueOnce(mockCategoriesWithNulls);

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
      // Mock user query to return no default budget account
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(createTransaction(createTransactionData)).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should throw error if category not found", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock budget account query to return account
      actualDb.limit.mockResolvedValueOnce([{ id: mockAccountId }]);
      // Mock category query to return no category
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(createTransaction(createTransactionData)).rejects.toThrow(
        "Category not found",
      );
    });

    it("should create transaction successfully", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock budget account query to return account
      actualDb.limit.mockResolvedValueOnce([{ id: mockAccountId }]);
      // Mock category query to return category
      actualDb.limit.mockResolvedValueOnce([mockCategory]);
      actualDb.values.mockResolvedValueOnce({});

      const result = await createTransaction(createTransactionData);

      expect(result).toEqual({ id: "mock-transaction-id" });
      expect(actualDb.insert).toHaveBeenCalled();
      expect(actualDb.values).toHaveBeenCalledWith({
        id: "mock-transaction-id",
        budgetAccountId: mockAccountId,
        categoryId: mockCategoryId,
        createdByUserId: mockUserId,
        amount: "100.5",
        description: "Test transaction",
        date: "2024-01-01",
        type: "expense",
        status: "completed",
        merchantName: "Test Merchant",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should create transaction without optional fields", async () => {
      const minimalData: CreateTransactionInput = {
        amount: 100.5,
        date: "2024-01-01",
        type: "income",
      };

      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock budget account query to return account
      actualDb.limit.mockResolvedValueOnce([{ id: mockAccountId }]);
      actualDb.values.mockResolvedValueOnce({});

      await createTransaction(minimalData);

      expect(actualDb.values).toHaveBeenCalledWith({
        id: "mock-transaction-id",
        budgetAccountId: mockAccountId,
        categoryId: null,
        createdByUserId: mockUserId,
        amount: "100.5",
        description: null,
        date: "2024-01-01",
        type: "income",
        status: "completed",
        merchantName: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
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
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock transaction query to return no transaction
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(updateTransaction(updateTransactionData)).rejects.toThrow(
        "Transaction not found",
      );
    });

    it("should throw error if category not found", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock transaction query to return transaction
      actualDb.limit.mockResolvedValueOnce([mockTransaction]);
      // Mock category query to return no category
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(updateTransaction(updateTransactionData)).rejects.toThrow(
        "Category not found",
      );
    });

    it("should update transaction successfully", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock transaction query to return transaction
      actualDb.limit.mockResolvedValueOnce([mockTransaction]);
      // Mock category query to return category
      actualDb.limit.mockResolvedValueOnce([mockCategory]);

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      const result = await updateTransaction(updateTransactionData);

      expect(result).toEqual({ id: mockTransactionId });
      expect(actualDb.update).toHaveBeenCalled();
      expect(actualDb.set).toHaveBeenCalledWith({
        amount: "200.75",
        description: "Updated transaction",
        categoryId: mockCategoryId,
        updatedAt: expect.any(Date),
      });
    });

    it("should update only provided fields", async () => {
      const partialUpdate: UpdateTransactionInput = {
        id: mockTransactionId,
        amount: 150.25,
      };

      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock transaction query to return transaction
      actualDb.limit.mockResolvedValueOnce([mockTransaction]);

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      await updateTransaction(partialUpdate);

      expect(actualDb.set).toHaveBeenCalledWith({
        amount: "150.25",
        updatedAt: expect.any(Date),
      });
    });

    it("should handle date updates", async () => {
      const dateUpdate: UpdateTransactionInput = {
        id: mockTransactionId,
        date: "2024-02-01",
      };

      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock transaction query to return transaction
      actualDb.limit.mockResolvedValueOnce([mockTransaction]);

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      await updateTransaction(dateUpdate);

      expect(actualDb.set).toHaveBeenCalledWith({
        date: "2024-02-01",
        updatedAt: expect.any(Date),
      });
    });

    it("should handle date format correctly to avoid timezone issues", async () => {
      // Test the specific case mentioned by the user: 7/31 being saved as 7/1
      const dateUpdate: UpdateTransactionInput = {
        id: mockTransactionId,
        date: "2024-07-31", // July 31st
      };

      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock transaction query to return transaction
      actualDb.limit.mockResolvedValueOnce([mockTransaction]);

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      await updateTransaction(dateUpdate);

      // Verify that the date is correctly parsed as July 31st, not July 1st
      expect(actualDb.set).toHaveBeenCalledWith({
        date: "2024-07-31",
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("updateTransactionCategory", () => {
    it("should throw error if category not found", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock category query to return no category
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(
        updateTransactionCategory(mockTransactionId, mockCategoryId),
      ).rejects.toThrow("Category not found");
    });

    it("should update transaction category successfully", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock category query to return category
      actualDb.limit.mockResolvedValueOnce([mockCategory]);

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      const result = await updateTransactionCategory(
        mockTransactionId,
        mockCategoryId,
      );

      expect(result).toEqual({ id: mockTransactionId });
      expect(actualDb.update).toHaveBeenCalled();
      expect(actualDb.set).toHaveBeenCalledWith({
        categoryId: mockCategoryId,
        updatedAt: expect.any(Date),
      });
    });

    it("should allow removing category (setting to null)", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      const result = await updateTransactionCategory(mockTransactionId, null);

      expect(result).toEqual({ id: mockTransactionId });
      expect(actualDb.set).toHaveBeenCalledWith({
        categoryId: null,
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("deleteTransaction", () => {
    it("should delete transaction successfully", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      // Mock the delete chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.delete.mockReturnValue({ where: mockWhere });

      const result = await deleteTransaction(mockTransactionId);

      expect(result).toEqual({ id: mockTransactionId });
      expect(actualDb.delete).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
    });

    it("should use correct budget account ID for deletion", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      // Mock the delete chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.delete.mockReturnValue({ where: mockWhere });

      await deleteTransaction(mockTransactionId);

      expect(mockWhere).toHaveBeenCalled();
    });
  });

  describe("getDefaultBudgetAccountId (internal function)", () => {
    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      // This will be tested indirectly through other functions
      await expect(getTransactions()).rejects.toThrow("Not authenticated");
    });

    it("should throw error if no default budget account found", async () => {
      actualDb.limit.mockResolvedValueOnce([]); // No user found
      actualDb.orderBy.mockResolvedValueOnce([]); // Mock the transactions query

      await expect(getTransactions()).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should return default budget account ID", async () => {
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      actualDb.orderBy.mockResolvedValueOnce([]);

      await getTransactions();

      expect(actualDb.where).toHaveBeenCalled();
    });
  });
});
