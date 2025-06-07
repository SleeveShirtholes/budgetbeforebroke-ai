import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../category";

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
    groupBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    query: {
      categories: {
        findFirst: jest.fn(),
      },
    },
  },
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

describe("Category Actions", () => {
  const mockUserId = "user-123";
  const mockAccountId = "account-123";
  const mockCategoryId = "category-123";
  const mockSession = {
    user: { id: mockUserId },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth.api.getSession as jest.Mock).mockResolvedValue(mockSession);
    (headers as jest.Mock).mockResolvedValue({});
    // Reset all db mocks

    Object.values(actualDb).forEach((fn: unknown) => {
      if (typeof fn === "function" && "mockClear" in fn)
        (fn as jest.Mock).mockClear();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.values(actualDb.query.categories).forEach((fn: any) => {
      if ("mockClear" in fn) (fn as jest.Mock).mockClear();
    });
  });

  describe("getCategories", () => {
    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(getCategories(mockAccountId)).rejects.toThrow(
        "Not authenticated",
      );
    });

    it("should return categories with transaction counts", async () => {
      const mockCategories = [
        {
          id: mockCategoryId,
          name: "Test Category",
          description: "Test Description",
          color: "#FF0000",
          icon: "test-icon",
          transactionCount: 5,
        },
      ];
      actualDb.groupBy.mockResolvedValueOnce(mockCategories);

      const result = await getCategories(mockAccountId);

      expect(result).toEqual(mockCategories);
      expect(actualDb.select).toHaveBeenCalled();
    });
  });

  describe("createCategory", () => {
    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(
        createCategory({
          name: "Test Category",
          budgetAccountId: mockAccountId,
        }),
      ).rejects.toThrow("Not authenticated");
    });

    it("should throw error if no budget account id provided", async () => {
      await expect(
        createCategory({
          name: "Test Category",
          budgetAccountId: "",
        }),
      ).rejects.toThrow("No budget account id provided");
    });

    it("should throw error if category name already exists", async () => {
      actualDb.query.categories.findFirst.mockResolvedValue({
        id: mockCategoryId,
        name: "Test Category",
      });

      await expect(
        createCategory({
          name: "Test Category",
          budgetAccountId: mockAccountId,
        }),
      ).rejects.toThrow(
        "Category with this name already exists for this budget account.",
      );
    });

    it("should create a new category", async () => {
      actualDb.query.categories.findFirst.mockResolvedValue(null);
      actualDb.values.mockResolvedValueOnce({});

      const result = await createCategory({
        name: "Test Category",
        description: "Test Description",
        budgetAccountId: mockAccountId,
      });

      expect(result).toHaveProperty("id");
      expect(result.name).toBe("Test Category");
      expect(result.description).toBe("Test Description");
      expect(result.transactionCount).toBe(0);
    });
  });

  describe("updateCategory", () => {
    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(
        updateCategory({
          id: mockCategoryId,
          name: "Updated Category",
        }),
      ).rejects.toThrow("Not authenticated");
    });

    it("should update category successfully", async () => {
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      const result = await updateCategory({
        id: mockCategoryId,
        name: "Updated Category",
        description: "Updated Description",
      });

      expect(result).toEqual({
        id: mockCategoryId,
        name: "Updated Category",
        description: "Updated Description",
      });
    });
  });

  describe("deleteCategory", () => {
    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(
        deleteCategory({
          id: mockCategoryId,
        }),
      ).rejects.toThrow("Not authenticated");
    });

    it("should delete category and reassign transactions", async () => {
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      const result = await deleteCategory({
        id: mockCategoryId,
        reassignToCategoryId: "new-category-123",
      });

      expect(result).toEqual({ success: true });
      expect(actualDb.update).toHaveBeenCalled();
      expect(actualDb.delete).toHaveBeenCalled();
    });

    it("should delete category without reassigning transactions", async () => {
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      const result = await deleteCategory({
        id: mockCategoryId,
      });

      expect(result).toEqual({ success: true });
      expect(actualDb.update).not.toHaveBeenCalled();
      expect(actualDb.delete).toHaveBeenCalled();
    });
  });
});
