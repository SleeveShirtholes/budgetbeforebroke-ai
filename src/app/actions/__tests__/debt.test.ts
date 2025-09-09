import {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
  createDebtPayment,
  type CreateDebtInput,
  type UpdateDebtInput,
  type CreateDebtPaymentInput,
} from "../debt";

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
    debt: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    budgetAccount: {
      findFirst: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    monthlyDebtPlanning: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    debtAllocation: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

describe("Debt Actions", () => {
  const mockUserId = "user-123";
  const mockAccountId = "account-123";
  const mockDebtId = "debt-123";
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

  describe("getDebts", () => {
    it("should return debts with payments", async () => {
      const mockDebts = [
        {
          id: mockDebtId,
          name: "Credit Card",
          paymentAmount: 1500,
          interestRate: 18.99,
          dueDate: new Date("2024-02-15"),
          categoryId: mockCategoryId,
          budgetAccountId: mockAccountId,
          createdByUserId: mockUserId,
          hasBalance: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          lastPaymentMonth: null,
          category: {
            id: mockCategoryId,
            name: "Debts",
          },
          monthlyPlanning: [],
        },
      ];

      const mockPayments = [
        {
          id: "payment-1",
          monthlyDebtPlanningId: "planning-1",
          paymentAmount: 100,
          paymentDate: new Date("2024-01-15"),
          note: null,
          isPaid: false,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ];

      mockDb.debt.findMany.mockResolvedValue(mockDebts);
      mockDb.debtAllocation.findMany.mockResolvedValue(mockPayments);

      const result = await getDebts();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockDebtId,
        name: "Credit Card",
        paymentAmount: 1500,
        interestRate: 18.99,
        dueDate: "2024-02-15",
        categoryId: mockCategoryId,
        budgetAccountId: mockAccountId,
        createdByUserId: mockUserId,
        hasBalance: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        category: {
          id: mockCategoryId,
          name: "Debts",
        },
        payments: [
          {
            id: "payment-1",
            debtId: expect.any(String),
            amount: 100,
            date: "2024-01-15",
            note: null,
            isPaid: false,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ],
      });
    });

    it("should return debts without payments", async () => {
      const mockDebts = [
        {
          id: mockDebtId,
          name: "Credit Card",
          paymentAmount: 1500,
          interestRate: 18.99,
          dueDate: new Date("2024-02-15"),
          categoryId: mockCategoryId,
          budgetAccountId: mockAccountId,
          createdByUserId: mockUserId,
          hasBalance: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          lastPaymentMonth: null,
          category: {
            id: mockCategoryId,
            name: "Debts",
          },
          monthlyPlanning: [],
        },
      ];

      mockDb.debt.findMany.mockResolvedValue(mockDebts);
      mockDb.debtAllocation.findMany.mockResolvedValue([]); // No payments

      const result = await getDebts();

      expect(result).toHaveLength(1);
      expect(result[0].payments).toEqual([]);
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";
      mockDb.debt.findMany.mockResolvedValue([]);

      await getDebts(customAccountId);

      expect(mockDb.debt.findMany).toHaveBeenCalledWith({
        where: {
          budgetAccountId: customAccountId,
        },
        include: {
          category: true,
          monthlyPlanning: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should convert string amounts to numbers", async () => {
      const mockDebts = [
        {
          id: mockDebtId,
          name: "Credit Card",
          paymentAmount: "1500.50", // String amount to be converted
          interestRate: "18.99", // String amount to be converted
          dueDate: new Date("2024-02-15"),
          categoryId: mockCategoryId,
          budgetAccountId: mockAccountId,
          createdByUserId: mockUserId,
          hasBalance: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          lastPaymentMonth: null,
          category: {
            id: mockCategoryId,
            name: "Debts",
          },
          monthlyPlanning: [],
        },
      ];

      mockDb.debt.findMany.mockResolvedValue(mockDebts);
      mockDb.debtAllocation.findMany.mockResolvedValue([]); // No payments

      const result = await getDebts();

      expect(result[0].paymentAmount).toBe(1500.5);
      expect(result[0].interestRate).toBe(18.99);
    });

    it("should throw error if no default budget account found", async () => {
      mockDb.user.findFirst.mockResolvedValue({});

      await expect(getDebts()).rejects.toThrow(
        "No default budget account found",
      );
    });
  });

  describe("createDebt", () => {
    const mockDebtData: CreateDebtInput = {
      name: "Credit Card",
      paymentAmount: 1500,
      interestRate: 18.99,
      dueDate: "2024-02-15",
      categoryId: mockCategoryId,
    };

    it("should create debt successfully", async () => {
      const mockCreatedDebt = {
        id: mockDebtId,
        ...mockDebtData,
        budgetAccountId: mockAccountId,
      };

      mockDb.budgetAccount.findFirst.mockResolvedValue({
        id: mockAccountId,
      });
      mockDb.category.findFirst.mockResolvedValue({
        id: mockCategoryId,
        name: "Debts",
      });
      mockDb.debt.create.mockResolvedValue(mockCreatedDebt);

      const result = await createDebt(mockDebtData);

      expect(result).toEqual({ id: mockDebtId });
      expect(mockDb.debt.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          budgetAccountId: mockAccountId,
          createdByUserId: expect.any(String),
          categoryId: mockCategoryId,
          name: "Credit Card",
          paymentAmount: 1500,
          interestRate: 18.99,
          dueDate: expect.any(Date),
          hasBalance: false,
        },
      });
    });

    it("should throw error if no default budget account found", async () => {
      mockDb.user.findFirst.mockResolvedValue({});

      await expect(createDebt(mockDebtData)).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should throw error if budget account not found", async () => {
      mockDb.budgetAccount.findFirst.mockResolvedValue(null);

      await expect(createDebt(mockDebtData)).rejects.toThrow(
        "Budget account not found",
      );
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";
      mockDb.budgetAccount.findFirst.mockResolvedValue({
        id: customAccountId,
      });
      mockDb.debt.create.mockResolvedValue({
        id: mockDebtId,
        ...mockDebtData,
        budgetAccountId: customAccountId,
      });

      await createDebt(mockDebtData, customAccountId);

      expect(mockDb.budgetAccount.findFirst).toHaveBeenCalledWith({
        where: { id: customAccountId },
      });
    });
  });

  describe("updateDebt", () => {
    const mockUpdateData: UpdateDebtInput = {
      id: mockDebtId,
      name: "Updated Credit Card",
      paymentAmount: 1200,
      interestRate: 19.99,
      dueDate: "2024-03-15",
      categoryId: mockCategoryId,
    };

    it("should update debt successfully", async () => {
      const mockUpdatedDebt = {
        id: mockDebtId,
        ...mockUpdateData,
        budgetAccountId: mockAccountId,
      };

      mockDb.debt.findFirst.mockResolvedValue({
        id: mockDebtId,
        budgetAccountId: mockAccountId,
      });
      mockDb.category.findFirst.mockResolvedValue({
        id: mockCategoryId,
        name: "Debts",
      });
      mockDb.debt.update.mockResolvedValue(mockUpdatedDebt);

      const result = await updateDebt(mockUpdateData);

      expect(result).toEqual({ id: mockDebtId });
      expect(mockDb.debt.update).toHaveBeenCalledWith({
        where: { id: mockDebtId },
        data: {
          name: mockUpdateData.name,
          paymentAmount: mockUpdateData.paymentAmount,
          interestRate: mockUpdateData.interestRate,
          dueDate: expect.any(Date),
          categoryId: mockUpdateData.categoryId,
        },
      });
    });

    it("should throw error if no default budget account found", async () => {
      mockDb.user.findFirst.mockResolvedValue({});

      await expect(updateDebt(mockUpdateData)).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should throw error if debt not found", async () => {
      mockDb.debt.findFirst.mockResolvedValue(null);

      await expect(updateDebt(mockUpdateData)).rejects.toThrow(
        "Debt not found",
      );
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";
      mockDb.debt.findFirst.mockResolvedValue({
        id: mockDebtId,
        budgetAccountId: customAccountId,
      });
      mockDb.debt.update.mockResolvedValue({
        id: mockDebtId,
        ...mockUpdateData,
        budgetAccountId: customAccountId,
      });

      await updateDebt(mockUpdateData, customAccountId);

      expect(mockDb.debt.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockDebtId,
          budgetAccountId: customAccountId,
        },
      });
    });
  });

  describe("deleteDebt", () => {
    it("should delete debt successfully", async () => {
      mockDb.debt.findFirst.mockResolvedValue({
        id: mockDebtId,
        budgetAccountId: mockAccountId,
      });
      mockDb.debt.delete.mockResolvedValue({
        id: mockDebtId,
      });

      const result = await deleteDebt(mockDebtId);

      expect(result).toEqual({ id: mockDebtId });
      expect(mockDb.debt.delete).toHaveBeenCalledWith({
        where: { id: mockDebtId },
      });
    });

    it("should throw error if no default budget account found", async () => {
      mockDb.user.findFirst.mockResolvedValue({});

      await expect(deleteDebt(mockDebtId)).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should throw error if debt not found", async () => {
      mockDb.debt.findFirst.mockResolvedValue(null);

      await expect(deleteDebt(mockDebtId)).rejects.toThrow("Debt not found");
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";
      mockDb.debt.findFirst.mockResolvedValue({
        id: mockDebtId,
        budgetAccountId: customAccountId,
      });
      mockDb.debt.delete.mockResolvedValue({
        id: mockDebtId,
      });

      await deleteDebt(mockDebtId, customAccountId);

      expect(mockDb.debt.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockDebtId,
          budgetAccountId: customAccountId,
        },
      });
    });
  });

  describe("createDebtPayment", () => {
    const mockPaymentData: CreateDebtPaymentInput = {
      debtId: mockDebtId,
      amount: 100,
      date: "2024-01-15",
    };

    it("should create payment and update debt balance successfully", async () => {
      const mockDebt = {
        id: mockDebtId,
        balance: 1500,
        minimumPayment: 50,
        dueDate: "2024-02-15",
        budgetAccountId: mockAccountId,
      };

      mockDb.debt.findFirst.mockResolvedValue(mockDebt);
      mockDb.category.findFirst.mockResolvedValue({
        id: mockCategoryId,
      });
      mockDb.transaction.create.mockResolvedValue({
        id: "transaction-1",
      });
      mockDb.debt.update.mockResolvedValue({
        id: mockDebtId,
        balance: 1400,
      });
      mockDb.monthlyDebtPlanning.findFirst.mockResolvedValue(null);
      mockDb.monthlyDebtPlanning.create.mockResolvedValue({
        id: "planning-1",
      });

      const result = await createDebtPayment(mockPaymentData);

      expect(result).toEqual({
        id: expect.any(String),
      });
    });

    it("should throw error if no default budget account found", async () => {
      mockDb.user.findFirst.mockResolvedValue({});

      await expect(createDebtPayment(mockPaymentData)).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should throw error if debt not found", async () => {
      mockDb.debt.findFirst.mockResolvedValue(null);

      await expect(createDebtPayment(mockPaymentData)).rejects.toThrow(
        "Debt not found",
      );
    });

    it("should throw error if payment amount exceeds balance", async () => {
      const mockDebt = {
        id: mockDebtId,
        paymentAmount: 50, // Function checks this field
        hasBalance: true, // Function checks this flag
        dueDate: new Date("2024-02-15"),
        budgetAccountId: mockAccountId,
      };

      mockDb.debt.findFirst.mockResolvedValue(mockDebt);

      await expect(
        createDebtPayment({
          ...mockPaymentData,
          amount: 100,
        }),
      ).rejects.toThrow("Payment amount cannot exceed current balance");
    });

    it("should create Debts category if it doesn't exist", async () => {
      const mockDebt = {
        id: mockDebtId,
        balance: 1500,
        minimumPayment: 50,
        dueDate: "2024-02-15",
        budgetAccountId: mockAccountId,
      };

      mockDb.debt.findFirst.mockResolvedValue(mockDebt);
      mockDb.category.findFirst.mockResolvedValue(null);
      mockDb.category.create.mockResolvedValue({
        id: mockCategoryId,
        name: "Debts",
      });
      mockDb.transaction.create.mockResolvedValue({
        id: "transaction-1",
      });
      mockDb.debt.update.mockResolvedValue({
        id: mockDebtId,
        balance: 1400,
      });
      mockDb.monthlyDebtPlanning.findFirst.mockResolvedValue(null);
      mockDb.monthlyDebtPlanning.create.mockResolvedValue({
        id: "planning-1",
      });

      await createDebtPayment(mockPaymentData);

      expect(mockDb.category.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          name: "Debts",
          budgetAccountId: mockAccountId,
          color: "#ef4444",
          description: "Debt payments and related expenses",
        },
      });
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";
      const mockDebt = {
        id: mockDebtId,
        balance: 1500,
        minimumPayment: 50,
        dueDate: "2024-02-15",
        budgetAccountId: customAccountId,
      };

      mockDb.debt.findFirst.mockResolvedValue(mockDebt);
      mockDb.category.findFirst.mockResolvedValue({
        id: mockCategoryId,
      });
      mockDb.transaction.create.mockResolvedValue({
        id: "transaction-1",
      });
      mockDb.debt.update.mockResolvedValue({
        id: mockDebtId,
        balance: 1400,
      });
      mockDb.monthlyDebtPlanning.findFirst.mockResolvedValue(null);
      mockDb.monthlyDebtPlanning.create.mockResolvedValue({
        id: "planning-1",
      });

      await createDebtPayment(mockPaymentData, customAccountId);

      expect(mockDb.debt.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockDebtId,
          budgetAccountId: customAccountId,
        },
      });
    });
  });
});
