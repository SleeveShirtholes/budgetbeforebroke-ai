import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../category";

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
    },
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    transaction: {
      updateMany: jest.fn(),
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

  const mockDb = jest.requireMock("@/db/config").db;
  const mockAuth = jest.requireMock("@/lib/auth").auth;
  const mockHeaders = jest.requireMock("next/headers").headers;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authenticated session
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockHeaders.mockResolvedValue({});

    // Mock user lookup
    mockDb.user.findFirst.mockResolvedValue({
      defaultBudgetAccountId: mockAccountId,
    });
  });

  describe("getCategories", () => {
    it("should return categories with transaction counts", async () => {
      const mockCategories = [
        {
          id: mockCategoryId,
          name: "Groceries",
          description: "Food and household items",
          color: "#FF5733",
          icon: "shopping-cart",
          _count: {
            transactions: 5,
          },
        },
      ];

      mockDb.category.findMany.mockResolvedValue(mockCategories);

      const result = await getCategories(mockAccountId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockCategoryId,
        name: "Groceries",
        description: "Food and household items",
        color: "#FF5733",
        icon: "shopping-cart",
        transactionCount: 5,
      });
    });

    it("should throw error when not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(getCategories(mockAccountId)).rejects.toThrow(
        "Not authenticated",
      );
    });
  });

  describe("createCategory", () => {
    it("should create a new category", async () => {
      const categoryData = {
        name: "Entertainment",
        description: "Movies, games, etc.",
        budgetAccountId: mockAccountId,
      };

      mockDb.category.findFirst.mockResolvedValue(null); // No existing category
      mockDb.category.create.mockResolvedValue({
        id: "generated-uuid",
        name: categoryData.name,
        description: categoryData.description,
      });

      const result = await createCategory(categoryData);

      expect(result).toEqual({
        id: expect.any(String),
        name: categoryData.name,
        description: categoryData.description,
        transactionCount: 0,
      });
      expect(mockDb.category.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          name: categoryData.name,
          description: categoryData.description,
          budgetAccountId: mockAccountId,
        },
      });
    });

    it("should throw error if category name already exists", async () => {
      const categoryData = {
        name: "Groceries",
        description: "Food items",
        budgetAccountId: mockAccountId,
      };

      mockDb.category.findFirst.mockResolvedValue({
        id: "existing-category",
        name: "Groceries",
      });

      await expect(createCategory(categoryData)).rejects.toThrow(
        "Category with this name already exists for this budget account.",
      );
    });

    it("should throw error when not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(createCategory({ name: "Test" })).rejects.toThrow(
        "Not authenticated",
      );
    });
  });

  describe("updateCategory", () => {
    it("should update category successfully", async () => {
      const updateData = {
        id: mockCategoryId,
        name: "Updated Groceries",
        description: "Updated description",
      };

      const mockUpdatedCategory = {
        id: mockCategoryId,
        name: updateData.name,
        description: updateData.description,
      };

      mockDb.category.updateMany.mockResolvedValue({ count: 1 });

      const result = await updateCategory(updateData);

      expect(result).toEqual(mockUpdatedCategory);
      expect(mockDb.category.updateMany).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          budgetAccountId: mockAccountId,
        },
        data: {
          name: updateData.name,
          description: updateData.description,
        },
      });
    });

    it("should throw error when not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(
        updateCategory({ id: mockCategoryId, name: "Test" }),
      ).rejects.toThrow("Not authenticated");
    });
  });

  describe("deleteCategory", () => {
    it("should delete category and reassign transactions", async () => {
      const reassignToCategoryId = "other-category-123";

      mockDb.transaction.updateMany.mockResolvedValue({ count: 3 });
      mockDb.category.deleteMany.mockResolvedValue({ count: 1 });

      const result = await deleteCategory({
        id: mockCategoryId,
        reassignToCategoryId,
      });

      expect(result).toEqual({ success: true });
      expect(mockDb.transaction.updateMany).toHaveBeenCalledWith({
        where: {
          categoryId: mockCategoryId,
          budgetAccountId: mockAccountId,
        },
        data: {
          categoryId: reassignToCategoryId,
        },
      });
      expect(mockDb.category.deleteMany).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          budgetAccountId: mockAccountId,
        },
      });
    });

    it("should delete category without reassigning transactions", async () => {
      mockDb.category.deleteMany.mockResolvedValue({ count: 1 });

      const result = await deleteCategory({ id: mockCategoryId });

      expect(result).toEqual({ success: true });
      expect(mockDb.transaction.updateMany).not.toHaveBeenCalled();
      expect(mockDb.category.deleteMany).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          budgetAccountId: mockAccountId,
        },
      });
    });

    it("should throw error when not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(deleteCategory({ id: mockCategoryId })).rejects.toThrow(
        "Not authenticated",
      );
    });
  });
});
