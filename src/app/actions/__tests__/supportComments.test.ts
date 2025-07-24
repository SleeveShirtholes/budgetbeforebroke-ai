import {
  getSupportCommentsForRequests,
  addSupportComment,
} from "../supportComments";

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

describe("SupportComments Actions", () => {
  const mockSupportComment = {
    id: "comment-1",
    requestId: "request-1",
    userId: "user-1",
    text: "This is a test comment",
    timestamp: new Date("2024-01-01T01:00:00Z"),
    userName: "Test User",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSupportCommentsForRequests", () => {
    it("should fetch comments for given request IDs", async () => {
      const mockQueryBuilder = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([mockSupportComment]),
      };
      (db.select as jest.Mock).mockReturnValueOnce(mockQueryBuilder);
      const result = await getSupportCommentsForRequests(["request-1"]);
      expect(result).toEqual([mockSupportComment]);
    });
    it("should return empty array if no request IDs provided", async () => {
      const result = await getSupportCommentsForRequests([]);
      expect(result).toEqual([]);
    });
  });

  describe("addSupportComment", () => {
    it("should add a comment to a support request successfully", async () => {
      const mockInsert = {
        values: jest.fn().mockResolvedValue(undefined),
      };
      const mockUpdate = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);
      (db.update as jest.Mock).mockReturnValue(mockUpdate);
      const commentData = {
        requestId: "request-1",
        text: "This is a new comment",
        userId: "user-1",
      };
      const result = await addSupportComment(commentData);
      expect(result).toEqual({
        id: mockUUID,
        requestId: "request-1",
        text: "This is a new comment",
        timestamp: expect.any(Date),
        userId: "user-1",
      });
      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(mockInsert.values).toHaveBeenCalledWith({
        id: mockUUID,
        requestId: "request-1",
        text: "This is a new comment",
        timestamp: expect.any(Date),
        userId: "user-1",
      });
      expect(db.update).toHaveBeenCalledTimes(1);
      expect(mockUpdate.set).toHaveBeenCalledWith({
        lastUpdated: expect.any(Date),
      });
    });
    it("should throw error when userId is not provided", async () => {
      const commentData = {
        requestId: "request-1",
        text: "This is a new comment",
        userId: "",
      };
      await expect(addSupportComment(commentData)).rejects.toThrow(
        "Not authenticated",
      );
    });
  });
});
