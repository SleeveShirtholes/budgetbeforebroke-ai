import {
  getSupportCommentsForRequests,
  addSupportComment,
} from "../supportComments";

import { db } from "@/db/config";
import crypto from "crypto";

// Mock dependencies
jest.mock("@/db/config", () => ({
  db: {
    supportComment: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    supportRequest: {
      update: jest.fn(),
    },
  },
}));

// Mock crypto.randomUUID
const mockUUID: `${string}-${string}-${string}-${string}-${string}` =
  "mock-uuid-12345-1234-1234-1234-123456789abc";
jest.spyOn(crypto, "randomUUID").mockImplementation(() => mockUUID);

describe("SupportComments Actions", () => {
  const mockSupportCommentWithUser = {
    id: "comment-1",
    requestId: "request-1",
    userId: "user-1",
    text: "This is a test comment",
    timestamp: new Date("2024-01-01T01:00:00Z"),
    user: {
      name: "Test User",
    },
  };

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
      (db.supportComment.findMany as jest.Mock).mockResolvedValue([
        mockSupportCommentWithUser,
      ]);

      const result = await getSupportCommentsForRequests(["request-1"]);

      expect(result).toEqual([mockSupportComment]);
      expect(db.supportComment.findMany).toHaveBeenCalledWith({
        where: {
          requestId: {
            in: ["request-1"],
          },
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          timestamp: "asc",
        },
      });
    });

    it("should return empty array if no request IDs provided", async () => {
      const result = await getSupportCommentsForRequests([]);
      expect(result).toEqual([]);
      expect(db.supportComment.findMany).not.toHaveBeenCalled();
    });
  });

  describe("addSupportComment", () => {
    it("should add a comment to a support request successfully", async () => {
      const commentData = {
        requestId: "request-1",
        text: "This is a new comment",
        userId: "user-1",
      };

      (db.supportComment.create as jest.Mock).mockResolvedValue({
        id: mockUUID,
        ...commentData,
        timestamp: expect.any(Date),
      });
      (db.supportRequest.update as jest.Mock).mockResolvedValue({});

      const result = await addSupportComment(commentData);

      expect(result).toEqual({
        id: mockUUID,
        ...commentData,
        timestamp: expect.any(Date),
      });
      expect(db.supportComment.create).toHaveBeenCalledWith({
        data: {
          id: mockUUID,
          requestId: commentData.requestId,
          userId: commentData.userId,
          text: commentData.text,
          timestamp: expect.any(Date),
        },
      });
      expect(db.supportRequest.update).toHaveBeenCalledWith({
        where: { id: commentData.requestId },
        data: { lastUpdated: expect.any(Date) },
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
