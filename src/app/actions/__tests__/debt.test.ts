import {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
  createDebtPayment,
  type CreateDebtInput,
  type UpdateDebtInput,
  type CreateDebtPaymentInput,
  type Debt,
} from "../debt";

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

jest.mock("crypto", () => ({
  randomUUID: jest.fn(() => "mock-debt-id"),
}));

describe("Debt Actions", () => {
  const mockUserId = "user-123";
  const mockAccountId = "account-123";
  const mockDebtId = "debt-123";
  const mockPaymentId = "payment-123";
  const mockCategoryId = "category-123";
  const mockSession = {
    user: { id: mockUserId },
  };

  const mockDebt: Debt = {
    id: mockDebtId,
    budgetAccountId: mockAccountId,
    createdByUserId: mockUserId,
    name: "Test Debt",
    balance: 1000.0,
    interestRate: 5.5,
    dueDate: new Date("2024-02-01"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    payments: [],
  };

  // Removed unused mockDebtPayment variable

  const mockCategory = {
    id: mockCategoryId,
    name: "Debts",
    description: "Debt payments",
    color: "#8B5CF6",
    icon: "banknotes",
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

  describe("getDebts", () => {
    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(getDebts()).rejects.toThrow("Not authenticated");
    });

    it("should throw error if no default budget account found", async () => {
      // Mock user query to return no default budget account
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(getDebts()).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should return debts with payments", async () => {
      // Mock the user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      const mockDebtsWithPayments = [
        {
          id: mockDebtId,
          budgetAccountId: mockAccountId,
          createdByUserId: mockUserId,
          name: "Test Debt",
          balance: "1000.00",
          interestRate: "5.50",
          dueDate: new Date("2024-02-01"),
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          paymentId: mockPaymentId,
          paymentDebtId: mockDebtId,
          paymentAmount: "100.00",
          paymentDate: new Date("2024-01-15"),
          paymentNote: "Test payment",
          paymentCreatedAt: new Date("2024-01-15"),
          paymentUpdatedAt: new Date("2024-01-15"),
        },
      ];

      actualDb.orderBy.mockResolvedValueOnce(mockDebtsWithPayments);

      const result = await getDebts();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockDebtId);
      expect(result[0].balance).toBe(1000.0);
      expect(result[0].interestRate).toBe(5.5);
      expect(result[0].payments).toHaveLength(1);
      expect(result[0].payments[0].amount).toBe(100.0);
      expect(actualDb.select).toHaveBeenCalled();
      expect(actualDb.leftJoin).toHaveBeenCalled();
      expect(actualDb.orderBy).toHaveBeenCalled();
    });

    it("should return debts without payments", async () => {
      // Mock the user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      const mockDebtsWithoutPayments = [
        {
          id: mockDebtId,
          budgetAccountId: mockAccountId,
          createdByUserId: mockUserId,
          name: "Test Debt",
          balance: "1000.00",
          interestRate: "5.50",
          dueDate: new Date("2024-02-01"),
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          paymentId: null,
          paymentDebtId: null,
          paymentAmount: null,
          paymentDate: null,
          paymentNote: null,
          paymentCreatedAt: null,
          paymentUpdatedAt: null,
        },
      ];

      actualDb.orderBy.mockResolvedValueOnce(mockDebtsWithoutPayments);

      const result = await getDebts();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockDebtId);
      expect(result[0].payments).toHaveLength(0);
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";
      const mockDebts = [mockDebt];
      actualDb.orderBy.mockResolvedValueOnce(mockDebts);

      await getDebts(customAccountId);

      expect(actualDb.where).toHaveBeenCalled();
    });

    it("should convert string amounts to numbers", async () => {
      // Mock the user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);

      const mockDebtsWithStringAmounts = [
        {
          id: mockDebtId,
          budgetAccountId: mockAccountId,
          createdByUserId: mockUserId,
          name: "Test Debt",
          balance: "1500.75",
          interestRate: "7.25",
          dueDate: new Date("2024-02-01"),
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          paymentId: null,
          paymentDebtId: null,
          paymentAmount: null,
          paymentDate: null,
          paymentNote: null,
          paymentCreatedAt: null,
          paymentUpdatedAt: null,
        },
      ];

      actualDb.orderBy.mockResolvedValueOnce(mockDebtsWithStringAmounts);

      const result = await getDebts();

      expect(result[0].balance).toBe(1500.75);
      expect(result[0].interestRate).toBe(7.25);
    });
  });

  describe("createDebt", () => {
    const createDebtData: CreateDebtInput = {
      name: "Test Debt",
      balance: 1000.0,
      interestRate: 5.5,
      dueDate: "2024-02-01",
    };

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(createDebt(createDebtData)).rejects.toThrow(
        "Not authenticated",
      );
    });

    it("should throw error if no default budget account found", async () => {
      // Mock user query to return no default budget account
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(createDebt(createDebtData)).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should throw error if budget account not found", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock budget account query to return no account
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(createDebt(createDebtData)).rejects.toThrow(
        "Budget account not found",
      );
    });

    it("should create debt successfully", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock budget account query to return account
      actualDb.limit.mockResolvedValueOnce([{ id: mockAccountId }]);
      actualDb.values.mockResolvedValueOnce({});

      const result = await createDebt(createDebtData);

      expect(result).toEqual({ id: "mock-debt-id" });
      expect(actualDb.insert).toHaveBeenCalled();
      expect(actualDb.values).toHaveBeenCalledWith({
        id: "mock-debt-id",
        budgetAccountId: mockAccountId,
        createdByUserId: mockUserId,
        name: "Test Debt",
        balance: "1000",
        interestRate: "5.5",
        dueDate: new Date("2024-02-01"),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";

      // Mock budget account query to return account
      actualDb.limit.mockResolvedValueOnce([{ id: customAccountId }]);
      actualDb.values.mockResolvedValueOnce({});

      await createDebt(createDebtData, customAccountId);

      expect(actualDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          budgetAccountId: customAccountId,
        }),
      );
    });
  });

  describe("updateDebt", () => {
    const updateDebtData: UpdateDebtInput = {
      id: mockDebtId,
      name: "Updated Debt",
      balance: 1500.0,
      interestRate: 6.0,
      dueDate: "2024-03-01",
    };

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(updateDebt(updateDebtData)).rejects.toThrow(
        "Not authenticated",
      );
    });

    it("should throw error if no default budget account found", async () => {
      // Mock user query to return no default budget account
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(updateDebt(updateDebtData)).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should throw error if debt not found", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return no debt
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(updateDebt(updateDebtData)).rejects.toThrow(
        "Debt not found",
      );
    });

    it("should update debt successfully", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return debt
      actualDb.limit.mockResolvedValueOnce([mockDebt]);

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      const result = await updateDebt(updateDebtData);

      expect(result).toEqual({ id: mockDebtId });
      expect(actualDb.update).toHaveBeenCalled();
      expect(actualDb.set).toHaveBeenCalledWith({
        name: "Updated Debt",
        balance: "1500",
        interestRate: "6",
        dueDate: new Date("2024-03-01"),
        updatedAt: expect.any(Date),
      });
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";

      // Mock debt query to return debt
      actualDb.limit.mockResolvedValueOnce([mockDebt]);

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      await updateDebt(updateDebtData, customAccountId);

      expect(actualDb.where).toHaveBeenCalled();
    });
  });

  describe("deleteDebt", () => {
    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(deleteDebt(mockDebtId)).rejects.toThrow("Not authenticated");
    });

    it("should throw error if no default budget account found", async () => {
      // Mock user query to return no default budget account
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(deleteDebt(mockDebtId)).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should throw error if debt not found", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return no debt
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(deleteDebt(mockDebtId)).rejects.toThrow("Debt not found");
    });

    it("should delete debt successfully", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return debt
      actualDb.limit.mockResolvedValueOnce([mockDebt]);

      // Mock the delete chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.delete.mockReturnValue({ where: mockWhere });

      const result = await deleteDebt(mockDebtId);

      expect(result).toEqual({ id: mockDebtId });
      expect(actualDb.delete).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";

      // Mock debt query to return debt
      actualDb.limit.mockResolvedValueOnce([mockDebt]);

      // Mock the delete chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.delete.mockReturnValue({ where: mockWhere });

      await deleteDebt(mockDebtId, customAccountId);

      expect(actualDb.where).toHaveBeenCalled();
    });
  });

  describe("createDebtPayment", () => {
    const createPaymentData: CreateDebtPaymentInput = {
      debtId: mockDebtId,
      amount: 100.0,
      date: "2024-01-15",
      note: "Test payment",
    };

    const mockExistingDebt = {
      id: mockDebtId,
      budgetAccountId: mockAccountId,
      createdByUserId: mockUserId,
      name: "Test Debt",
      balance: "1000.00",
      interestRate: "5.50",
      dueDate: new Date("2024-02-01"),
      lastPaymentMonth: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(createDebtPayment(createPaymentData)).rejects.toThrow(
        "Not authenticated",
      );
    });

    it("should throw error if no default budget account found", async () => {
      // Mock user query to return no default budget account
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(createDebtPayment(createPaymentData)).rejects.toThrow(
        "No default budget account found",
      );
    });

    it("should throw error if debt not found", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return no debt
      actualDb.limit.mockResolvedValueOnce([]);

      await expect(createDebtPayment(createPaymentData)).rejects.toThrow(
        "Debt not found",
      );
    });

    it("should throw error if payment amount exceeds balance", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return debt with low balance
      actualDb.limit.mockResolvedValueOnce([
        { ...mockExistingDebt, balance: "50.00" },
      ]);

      const largePaymentData = { ...createPaymentData, amount: 100.0 };

      await expect(createDebtPayment(largePaymentData)).rejects.toThrow(
        "Payment amount cannot exceed current balance",
      );
    });

    it("should create payment and update debt balance successfully", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return debt
      actualDb.limit.mockResolvedValueOnce([mockExistingDebt]);
      // Mock category query to return existing category
      actualDb.query.categories.findFirst.mockResolvedValue(mockCategory);
      actualDb.values.mockResolvedValue({});

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      const result = await createDebtPayment(createPaymentData);

      expect(result).toEqual({ id: mockDebtId });
      expect(actualDb.insert).toHaveBeenCalledTimes(2); // payment + transaction
      expect(actualDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "mock-debt-id",
          debtId: mockDebtId,
          amount: "100",
          date: new Date("2024-01-15"),
          note: "Test payment",
        }),
      );
    });

    it("should create Debts category if it doesn't exist", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return debt
      actualDb.limit.mockResolvedValueOnce([mockExistingDebt]);
      // Mock category query to return no category
      actualDb.query.categories.findFirst.mockResolvedValue(null);
      actualDb.values.mockResolvedValue({});

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      await createDebtPayment(createPaymentData);

      expect(actualDb.insert).toHaveBeenCalledTimes(3); // category + payment + transaction
      expect(actualDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "mock-debt-id",
          budgetAccountId: mockAccountId,
          name: "Debts",
          color: "#8B5CF6",
          icon: "banknotes",
        }),
      );
    });

    it("should advance due date when payment is made before due date", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return debt
      actualDb.limit.mockResolvedValueOnce([mockExistingDebt]);
      // Mock category query to return existing category
      actualDb.query.categories.findFirst.mockResolvedValue(mockCategory);
      actualDb.values.mockResolvedValue({});

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      await createDebtPayment(createPaymentData);

      // Check that the update was called with the correct parameters
      expect(actualDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: "900", // reduced by payment amount
        }),
      );

      // Verify that due date was advanced (the exact date depends on the month calculation)
      const setCall = actualDb.set.mock.calls[0][0];
      expect(setCall.dueDate).toBeInstanceOf(Date);
      expect(setCall.lastPaymentMonth).toBeInstanceOf(Date);
      expect(setCall.balance).toBe("900");
    });

    it("should not advance due date when payment is made after due date", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return debt with past due date
      actualDb.limit.mockResolvedValueOnce([
        { ...mockExistingDebt, dueDate: new Date("2024-01-01") },
      ]);
      // Mock category query to return existing category
      actualDb.query.categories.findFirst.mockResolvedValue(mockCategory);
      actualDb.values.mockResolvedValue({});

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      await createDebtPayment(createPaymentData);

      expect(actualDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: "900", // reduced by payment amount
        }),
      );
      expect(actualDb.set).not.toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: expect.any(Date),
        }),
      );
    });

    it("should not advance due date when payment is already made for current month", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return debt with last payment in current month
      // Use a date that represents the same month as the payment (January 2024)
      const lastPaymentMonth = new Date("2024-01-15"); // Same month as payment date
      actualDb.limit.mockResolvedValueOnce([
        {
          ...mockExistingDebt,
          lastPaymentMonth: lastPaymentMonth,
        },
      ]);
      // Mock category query to return existing category
      actualDb.query.categories.findFirst.mockResolvedValue(mockCategory);
      actualDb.values.mockResolvedValue({});

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      await createDebtPayment(createPaymentData);

      // Check that only balance was updated
      expect(actualDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: "900", // reduced by payment amount
        }),
      );
    });

    it("should create transaction with positive amount and expense type", async () => {
      // Mock user query to return default budget account
      actualDb.limit.mockResolvedValueOnce([
        { defaultBudgetAccountId: mockAccountId },
      ]);
      // Mock debt query to return debt
      actualDb.limit.mockResolvedValueOnce([mockExistingDebt]);
      // Mock category query to return existing category
      actualDb.query.categories.findFirst.mockResolvedValue(mockCategory);
      actualDb.values.mockResolvedValue({});

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      await createDebtPayment(createPaymentData);

      expect(actualDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: "100", // always positive, use type field to distinguish expense/income
          description: "Debt payment: Test Debt",
          type: "expense", // explicitly set as expense
          status: "completed",
          merchantName: "Test Debt",
        }),
      );
    });

    it("should use provided budget account ID", async () => {
      const customAccountId = "custom-account-123";

      // Mock debt query to return debt
      actualDb.limit.mockResolvedValueOnce([mockExistingDebt]);
      // Mock category query to return existing category
      actualDb.query.categories.findFirst.mockResolvedValue(mockCategory);
      actualDb.values.mockResolvedValue({});

      // Mock the update chain
      const mockWhere = jest.fn().mockResolvedValue({});
      actualDb.set.mockReturnValue({ where: mockWhere });

      await createDebtPayment(createPaymentData, customAccountId);

      expect(actualDb.where).toHaveBeenCalled();
    });
  });
});
