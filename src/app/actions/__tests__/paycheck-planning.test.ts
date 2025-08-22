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
    query: {
      budgetAccountMembers: {
        findFirst: jest.fn(),
      },
      incomeSources: {
        findMany: jest.fn(),
      },
      debts: {
        findMany: jest.fn(),
      },
      monthlyDebtPlanning: {
        findMany: jest.fn(),
        insert: jest.fn(),
      },
      debtAllocations: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        insert: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
      dismissedWarnings: {
        findFirst: jest.fn(),
        insert: jest.fn(),
      },
    },
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

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

    // Reset all db mocks
    Object.values(actualDb.query).forEach((queryObj) => {
      Object.values(queryObj as Record<string, unknown>).forEach((fn) => {
        if (typeof fn === "function" && "mockClear" in fn) {
          (fn as { mockClear: () => void }).mockClear();
        }
      });
    });

    // Ensure all mocks are properly initialized
    (
      actualDb.query.budgetAccountMembers.findFirst as jest.Mock
    ).mockResolvedValue({
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
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        getPaycheckPlanningData(mockAccountId, 2025, 1, 0),
      ).rejects.toThrow("Access denied to budget account");
    });

    it("should return planning data with paychecks and debts", async () => {
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (actualDb.query.incomeSources.findMany as jest.Mock).mockResolvedValue([
        {
          id: "income-1",
          name: "Salary",
          amount: "5000",
          frequency: "monthly",
          startDate: "2025-01-01",
        },
      ]);

      (actualDb.query.debts.findMany as jest.Mock).mockResolvedValue([
        {
          id: "debt-1",
          name: "Credit Card",
          paymentAmount: "500",
          dueDate: "2025-01-15",
          categoryId: "cat-1",
        },
      ]);

      (
        actualDb.query.monthlyDebtPlanning.findMany as jest.Mock
      ).mockResolvedValue([
        {
          id: "planning-1",
          debtId: "debt-1",
          dueDate: "2025-01-15",
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
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (
        actualDb.query.dismissedWarnings.findFirst as jest.Mock
      ).mockResolvedValue(null);

      const result = await dismissWarning(
        mockAccountId,
        "insufficient_funds",
        "warning-key",
      );

      expect(result).toEqual({ success: true });
      expect(actualDb.insert).toHaveBeenCalled();
    });

    it("should not create duplicate dismissal record", async () => {
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (
        actualDb.query.dismissedWarnings.findFirst as jest.Mock
      ).mockResolvedValue({
        id: "dismissal-1",
      });

      const result = await dismissWarning(
        mockAccountId,
        "insufficient_funds",
        "warning-key",
      );

      expect(result).toEqual({ success: true });
      expect(actualDb.insert).not.toHaveBeenCalled();
    });
  });

  describe("updateDebtAllocation", () => {
    it("should create new allocation when action is 'allocate'", async () => {
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (actualDb.query.debtAllocations.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await updateDebtAllocation(
        mockAccountId,
        "planning-1",
        "paycheck-1",
        "allocate",
        500,
        "2025-01-15",
      );

      expect(result).toEqual({ success: true });
      expect(actualDb.insert).toHaveBeenCalled();
    });

    it("should remove allocation when action is 'unallocate'", async () => {
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue({
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
      expect(actualDb.delete).toHaveBeenCalled();
    });
  });

  describe("markPaymentAsPaid", () => {
    it("should mark payment as paid", async () => {
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue({
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
      expect(actualDb.update).toHaveBeenCalled();
    });
  });

  describe("populateMonthlyDebtPlanning", () => {
    it("should create monthly planning records for debts", async () => {
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (actualDb.query.debts.findMany as jest.Mock).mockResolvedValue([
        {
          id: "debt-1",
          name: "Credit Card",
          dueDate: "2025-01-15",
        },
      ]);

      (
        actualDb.query.monthlyDebtPlanning.findMany as jest.Mock
      ).mockResolvedValue([]);

      await populateMonthlyDebtPlanning(mockAccountId, 2025, 1, 2);

      expect(actualDb.insert).toHaveBeenCalled();
    });
  });

  describe("setMonthlyDebtPlanningActive", () => {
    it("should set monthly debt planning record to inactive (hide)", async () => {
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      const result = await setMonthlyDebtPlanningActive(
        mockAccountId,
        "planning-1",
        false,
      );

      expect(result).toEqual({ success: true });
      expect(actualDb.update).toHaveBeenCalled();
    });

    it("should set monthly debt planning record to active (restore)", async () => {
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      const result = await setMonthlyDebtPlanningActive(
        mockAccountId,
        "planning-1",
        true,
      );

      expect(result).toEqual({ success: true });
      expect(actualDb.update).toHaveBeenCalled();
    });

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      await expect(
        setMonthlyDebtPlanningActive(mockAccountId, "planning-1", false),
      ).rejects.toThrow("User not authenticated");
    });

    it("should throw error if user has no access to budget account", async () => {
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        setMonthlyDebtPlanningActive(mockAccountId, "planning-1", false),
      ).rejects.toThrow("Access denied to budget account");
    });
  });

  describe("getHiddenMonthlyDebtPlanningData", () => {
    it("should return hidden monthly debt planning records", async () => {
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue({
        id: "member-123",
        role: "member",
      });

      (actualDb.query.debts.findMany as jest.Mock).mockResolvedValue([
        {
          id: "debt-1",
          name: "Credit Card",
          paymentAmount: "500",
          dueDate: "2025-01-15",
          categoryId: "cat-1",
        },
      ]);

      (
        actualDb.query.monthlyDebtPlanning.findMany as jest.Mock
      ).mockResolvedValue([
        {
          id: "planning-1",
          debtId: "debt-1",
          dueDate: "2025-01-15",
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
      (
        actualDb.query.budgetAccountMembers.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        getHiddenMonthlyDebtPlanningData(mockAccountId, 2025, 1, 0),
      ).rejects.toThrow("Access denied to budget account");
    });
  });
});
