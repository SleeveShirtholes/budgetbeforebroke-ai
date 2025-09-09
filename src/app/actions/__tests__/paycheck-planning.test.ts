import {
  getPaycheckPlanningData,
  dismissWarning,
  updateDebtAllocation,
  markPaymentAsPaid,
  populateMonthlyDebtPlanning,
  setMonthlyDebtPlanningActive,
  getHiddenMonthlyDebtPlanningData,
} from "../paycheck-planning";

import { db as importedDb } from "@/db/config";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Mock the dependencies first
jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

// Create comprehensive Prisma mock and jest.mock in the same place
jest.mock("@/db/config", () => ({
  db: {
    budgetAccountMember: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    incomeSource: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    debt: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    monthlyDebtPlanning: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createMany: jest.fn(),
    },
    debtAllocation: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    dismissedWarning: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Get the mocked db
const mockDb = importedDb as jest.Mocked<typeof importedDb>;

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

describe("Paycheck Planning Actions", () => {
  const mockUserId = "user-123";
  const mockAccountId = "account-123";
  const mockSession = {
    user: { id: mockUserId },
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

    // Ensure all mocks are properly initialized
    mockDb.budgetAccountMember.findFirst.mockResolvedValue({
      id: "member-123",
      role: "member",
    });
  });

  describe("getPaycheckPlanningData", () => {
    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(
        getPaycheckPlanningData(mockAccountId, 2025, 1, 0),
      ).rejects.toThrow("User not authenticated");
    });

    it("should throw error if user has no access to budget account", async () => {
      mockDb.budgetAccountMember.findFirst.mockResolvedValue(null);

      await expect(
        getPaycheckPlanningData(mockAccountId, 2025, 1, 0),
      ).rejects.toThrow("Access denied to budget account");
    });

    it("should return planning data with paychecks and debts", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (mockDb.incomeSource.findMany as jest.Mock).mockResolvedValue([
        {
          id: "income-1",
          name: "Salary",
          amount: "5000",
          frequency: "monthly",
          startDate: new Date("2025-01-01"),
        },
      ]);

      (mockDb.debt.findMany as jest.Mock).mockResolvedValue([
        {
          id: "debt-1",
          name: "Credit Card",
          paymentAmount: "500",
          dueDate: new Date("2025-01-15"),
          categoryId: "cat-1",
        },
      ]);

      (mockDb.monthlyDebtPlanning.findMany as jest.Mock).mockResolvedValue([
        {
          id: "planning-1",
          debtId: "debt-1",
          dueDate: new Date("2025-01-15"),
          isActive: true,
        },
      ]);

      const result = await getPaycheckPlanningData(mockAccountId, 2025, 1, 0);

      expect(result.paychecks).toHaveLength(1);
      expect(result.debts).toHaveLength(1);
      expect(result.warnings).toBeDefined();
    });
  });

  describe("dismissWarning", () => {
    it("should create dismissal record for new warning", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (mockDb.dismissedWarning.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await dismissWarning(
        mockAccountId,
        "insufficient_funds",
        "warning-key",
      );

      expect(result).toEqual({ success: true });
      expect(mockDb.dismissedWarning.create).toHaveBeenCalled();
    });

    it("should not create duplicate dismissal record", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (mockDb.dismissedWarning.findFirst as jest.Mock).mockResolvedValue({
        id: "dismissal-1",
      });

      const result = await dismissWarning(
        mockAccountId,
        "insufficient_funds",
        "warning-key",
      );

      expect(result).toEqual({ success: true });
      expect(mockDb.dismissedWarning.create).not.toHaveBeenCalled();
    });
  });

  describe("updateDebtAllocation", () => {
    it("should create new allocation when action is 'allocate'", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (mockDb.debtAllocation.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await updateDebtAllocation(
        mockAccountId,
        "planning-1",
        "paycheck-1",
        "allocate",
        500,
        "2025-01-15",
      );

      expect(result).toEqual({ success: true });
      expect(mockDb.debtAllocation.create).toHaveBeenCalled();
    });

    it("should remove allocation when action is 'unallocate'", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      const result = await updateDebtAllocation(
        mockAccountId,
        "planning-1",
        "paycheck-1",
        "unallocate",
      );

      expect(result).toEqual({ success: true });
      expect(mockDb.debtAllocation.deleteMany).toHaveBeenCalled();
    });
  });

  describe("markPaymentAsPaid", () => {
    it("should mark payment as paid", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      const result = await markPaymentAsPaid(
        mockAccountId,
        "planning-1",
        "allocation-1",
        500,
        "2025-01-15",
      );

      expect(result).toEqual({ success: true });
      expect(mockDb.debtAllocation.update).toHaveBeenCalled();
    });
  });

  describe("populateMonthlyDebtPlanning", () => {
    it("should create monthly planning records for debts", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (mockDb.debt.findMany as jest.Mock).mockResolvedValue([
        {
          id: "debt-1",
          name: "Credit Card",
          dueDate: new Date("2025-01-15"),
        },
      ]);

      (mockDb.monthlyDebtPlanning.findMany as jest.Mock).mockResolvedValue([]);

      await populateMonthlyDebtPlanning(mockAccountId, 2025, 1, 2);

      expect(mockDb.monthlyDebtPlanning.create).toHaveBeenCalled();
    });

    it("should create monthly planning records for the correct months based on debt due dates", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      // Mock debts with different due dates
      (mockDb.debt.findMany as jest.Mock).mockResolvedValue([
        {
          id: "debt-1",
          name: "Credit Card",
          dueDate: new Date("2025-01-15"), // Due in January
        },
        {
          id: "debt-2",
          name: "Student Loan",
          dueDate: new Date("2025-03-20"), // Due in March
        },
      ]);

      // Mock no existing monthly planning records
      (mockDb.monthlyDebtPlanning.findMany as jest.Mock).mockResolvedValue([]);

      // Call with current month = February 2025, planning window = 2 months
      await populateMonthlyDebtPlanning(mockAccountId, 2025, 2, 2);

      // Should create records for February, March, and April (current month + 2 months ahead)
      // But only for debts that are due on or before those months
      // debt-1 (due January): appears in Feb, Mar, Apr (3 records)
      // debt-2 (due March): appears in Mar, Apr (2 records)
      // Total: 5 records
      expect(mockDb.monthlyDebtPlanning.create).toHaveBeenCalledTimes(5);
    });

    it("should not create duplicate monthly planning records", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (mockDb.debt.findMany as jest.Mock).mockResolvedValue([
        {
          id: "debt-1",
          name: "Credit Card",
          dueDate: new Date("2025-01-15"),
        },
      ]);

      // Mock existing monthly planning records for some months
      (mockDb.monthlyDebtPlanning.findMany as jest.Mock).mockResolvedValue([
        {
          id: "planning-1",
          budgetAccountId: mockAccountId,
          debtId: "debt-1",
          year: 2025,
          month: 2, // February already exists
          dueDate: new Date("2025-02-15"),
          isActive: true,
        },
      ]);

      // Call with current month = February 2025, planning window = 2 months
      await populateMonthlyDebtPlanning(mockAccountId, 2025, 2, 2);

      // Should only create records for March and April (February already exists)
      // 1 debt × 2 months = 2 new records
      expect(mockDb.monthlyDebtPlanning.create).toHaveBeenCalledTimes(2);
    });

    it("should not create records for months before debt due date", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      // Mock a debt that's due in March
      (mockDb.debt.findMany as jest.Mock).mockResolvedValue([
        {
          id: "debt-1",
          name: "Student Loan",
          dueDate: new Date("2025-03-15"), // Due in March
        },
      ]);

      // Mock no existing monthly planning records
      (mockDb.monthlyDebtPlanning.findMany as jest.Mock).mockResolvedValue([]);

      // Call with current month = January 2025, planning window = 3 months
      await populateMonthlyDebtPlanning(mockAccountId, 2025, 1, 3);

      // Should only create records for March and April (not January or February)
      // January: month 1 < 3 (debt not due) - no record
      // February: month 2 < 3 (debt not due) - no record
      // March: month 3 >= 3 (debt is due) - record created
      // April: month 4 > 3 (debt is due) - record created
      // Total: 2 records
      expect(mockDb.monthlyDebtPlanning.create).toHaveBeenCalledTimes(2);
    });
  });

  describe("setMonthlyDebtPlanningActive", () => {
    it("should set monthly debt planning record to inactive (hide)", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      const result = await setMonthlyDebtPlanningActive(
        mockAccountId,
        "planning-1",
        false,
      );

      expect(result).toEqual({ success: true });
      expect(mockDb.monthlyDebtPlanning.update).toHaveBeenCalled();
    });

    it("should set monthly debt planning record to active (restore)", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      const result = await setMonthlyDebtPlanningActive(
        mockAccountId,
        "planning-1",
        true,
      );

      expect(result).toEqual({ success: true });
      expect(mockDb.monthlyDebtPlanning.update).toHaveBeenCalled();
    });

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(
        setMonthlyDebtPlanningActive(mockAccountId, "planning-1", false),
      ).rejects.toThrow("User not authenticated");
    });

    it("should throw error if user has no access to budget account", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        setMonthlyDebtPlanningActive(mockAccountId, "planning-1", false),
      ).rejects.toThrow("Access denied to budget account");
    });
  });

  describe("getHiddenMonthlyDebtPlanningData", () => {
    it("should return hidden monthly debt planning records", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (mockDb.debt.findMany as jest.Mock).mockResolvedValue([
        {
          id: "debt-1",
          name: "Credit Card",
          paymentAmount: "500",
          dueDate: new Date("2025-01-15"),
          categoryId: "cat-1",
        },
      ]);

      (mockDb.monthlyDebtPlanning.findMany as jest.Mock).mockResolvedValue([
        {
          id: "planning-1",
          debtId: "debt-1",
          dueDate: new Date("2025-01-15"),
          isActive: false,
        },
      ]);

      const result = await getHiddenMonthlyDebtPlanningData(
        mockAccountId,
        2025,
        1,
        0,
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Credit Card");
      expect(result[0].amount).toBe(500);
    });

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(
        getHiddenMonthlyDebtPlanningData(mockAccountId, 2025, 1, 0),
      ).rejects.toThrow("User not authenticated");
    });

    it("should throw error if user has no access to budget account", async () => {
      (mockDb.budgetAccountMember.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        getHiddenMonthlyDebtPlanningData(mockAccountId, 2025, 1, 0),
      ).rejects.toThrow("Access denied to budget account");
    });
  });
});
