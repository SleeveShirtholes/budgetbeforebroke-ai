import {
  getPublicSupportRequests,
  getMySupportRequests,
  createSupportRequest,
  upvoteSupportRequest,
  downvoteSupportRequest,
  updateSupportRequestStatus,
} from "../supportRequests";

import { db } from "@/db/config";
import crypto from "crypto";

// Mock dependencies
jest.mock("@/db/config", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock crypto.randomUUID
const mockUUID: `${string}-${string}-${string}-${string}-${string}` =
  "mock-uuid-12345-1234-1234-1234-123456789abc";
jest.spyOn(crypto, "randomUUID").mockImplementation(() => mockUUID);

describe("SupportRequests Actions", () => {
  const mockSupportRequest = {
    id: "request-1",
    title: "Test Support Request",
    description: "This is a test support request",
    category: "Issue",
    status: "Open",
    isPublic: true,
    userId: "user-1",
    upvotes: 5,
    downvotes: 1,
    lastUpdated: new Date("2024-01-01T00:00:00Z"),
    createdAt: new Date("2024-01-01T00:00:00Z"),
    user: "Test User",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPublicSupportRequests", () => {
    it("should fetch public support requests without status filter", async () => {
      const mockQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([mockSupportRequest]),
      };
      (db.select as jest.Mock).mockReturnValueOnce(mockQueryBuilder);
      const result = await getPublicSupportRequests();
      expect(result).toEqual([mockSupportRequest]);
    });
    it("should fetch public support requests with status filter", async () => {
      const mockQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([mockSupportRequest]),
      };
      (db.select as jest.Mock).mockReturnValueOnce(mockQueryBuilder);
      const result = await getPublicSupportRequests("Open");
      expect(result).toEqual([mockSupportRequest]);
    });
    it("should handle empty requests array", async () => {
      const mockQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
      };
      (db.select as jest.Mock).mockReturnValueOnce(mockQueryBuilder);
      const result = await getPublicSupportRequests();
      expect(result).toEqual([]);
      expect(db.select).toHaveBeenCalledTimes(1);
    });
  });

  describe("getMySupportRequests", () => {
    it("should fetch user's support requests without status filter", async () => {
      const mockQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([mockSupportRequest]),
      };
      (db.select as jest.Mock).mockReturnValueOnce(mockQueryBuilder);
      const result = await getMySupportRequests("user-1");
      expect(result).toEqual([mockSupportRequest]);
    });
    it("should fetch user's support requests with status filter", async () => {
      const mockQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([mockSupportRequest]),
      };
      (db.select as jest.Mock).mockReturnValueOnce(mockQueryBuilder);
      const result = await getMySupportRequests("user-1", "Closed");
      expect(result).toEqual([mockSupportRequest]);
    });
    it("should return empty array when userId is not provided", async () => {
      const result = await getMySupportRequests("");
      expect(result).toEqual([]);
    });
    it("should handle empty requests array", async () => {
      const mockQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
      };
      (db.select as jest.Mock).mockReturnValueOnce(mockQueryBuilder);
      const result = await getMySupportRequests("user-1");
      expect(result).toEqual([]);
      expect(db.select).toHaveBeenCalledTimes(1);
    });
  });

  describe("createSupportRequest", () => {
    it("should create a new support request successfully", async () => {
      const mockInsert = {
        values: jest.fn().mockResolvedValue(undefined),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);
      const requestData = {
        title: "New Support Request",
        description: "This is a new support request",
        category: "Feature Request",
        isPublic: true,
        userId: "user-1",
      };
      const result = await createSupportRequest(requestData);
      expect(result).toEqual({
        id: mockUUID,
        title: "New Support Request",
        description: "This is a new support request",
        category: "Feature Request",
        status: "Open",
        isPublic: true,
        userId: "user-1",
        upvotes: 0,
        downvotes: 0,
        lastUpdated: expect.any(Date),
        createdAt: expect.any(Date),
      });
      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(mockInsert.values).toHaveBeenCalledWith({
        id: mockUUID,
        title: "New Support Request",
        description: "This is a new support request",
        category: "Feature Request",
        status: "Open",
        isPublic: true,
        userId: "user-1",
        upvotes: 0,
        downvotes: 0,
        lastUpdated: expect.any(Date),
        createdAt: expect.any(Date),
      });
    });
    it("should throw error when userId is not provided", async () => {
      const requestData = {
        title: "New Support Request",
        description: "This is a new support request",
        category: "Feature Request",
        isPublic: true,
        userId: "",
      };
      await expect(createSupportRequest(requestData)).rejects.toThrow(
        "Not authenticated",
      );
    });
  });

  describe("upvoteSupportRequest", () => {
    it("should increment upvotes for a support request", async () => {
      const mockUpdate = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      };
      (db.update as jest.Mock).mockReturnValue(mockUpdate);
      await upvoteSupportRequest("request-1");
      expect(db.update).toHaveBeenCalledTimes(1);
      expect(mockUpdate.set).toHaveBeenCalledWith({
        upvotes: expect.any(Object),
      });
    });
  });

  describe("downvoteSupportRequest", () => {
    it("should increment downvotes for a support request", async () => {
      const mockUpdate = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      };
      (db.update as jest.Mock).mockReturnValue(mockUpdate);
      await downvoteSupportRequest("request-1");
      expect(db.update).toHaveBeenCalledTimes(1);
      expect(mockUpdate.set).toHaveBeenCalledWith({
        downvotes: expect.any(Object),
      });
    });
  });

  describe("updateSupportRequestStatus", () => {
    it("should update the status of a support request", async () => {
      const mockUpdate = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      };
      (db.update as jest.Mock).mockReturnValue(mockUpdate);
      await updateSupportRequestStatus("request-1", "Closed");
      expect(db.update).toHaveBeenCalledTimes(1);
      expect(mockUpdate.set).toHaveBeenCalledWith({
        status: "Closed",
        lastUpdated: expect.any(Date),
      });
    });
  });
});
