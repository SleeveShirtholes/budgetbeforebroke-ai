import {
  createContactSubmission,
  getContactSubmissions,
  updateContactSubmissionStatus,
  sendFollowUpEmailToUser,
  getConversationHistory,
  updateExistingSubmissionsWithConversationIds,
} from "../contact";
import { db } from "@/db/config";

// Mock the database
jest.mock("@/db/config", () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock drizzle-orm functions
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  desc: jest.fn(),
  isNull: jest.fn(),
  relations: jest.fn(),
  sql: jest.fn(),
}));

const mockDb = db as jest.Mocked<typeof db>;

describe("Contact Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createContactSubmission", () => {
    it("should create contact submission successfully", async () => {
      const mockSubmission = {
        id: "test-id",
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Test message",
        status: "new",
        conversationId: null,
        ipAddress: "127.0.0.1",
        userAgent: "Test Browser",
        notes: null,
        assignedTo: null,
        resolvedAt: null,
        lastUserMessageAt: null,
        lastSupportMessageAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockSubmission]),
        }),
      } as unknown);

      const result = await createContactSubmission({
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Test message",
        ipAddress: "127.0.0.1",
        userAgent: "Test Browser",
      });

      expect(result.success).toBe(true);
      expect(result.submission).toEqual(mockSubmission);
    });

    it("should handle database errors gracefully", async () => {
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      } as unknown);

      const result = await createContactSubmission({
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Test message",
        ipAddress: "127.0.0.1",
        userAgent: "Test Browser",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Database error");
    });
  });

  describe("getContactSubmissions", () => {
    it("should retrieve contact submissions successfully", async () => {
      const mockSubmissions = [
        {
          id: "test-1",
          name: "User 1",
          email: "user1@example.com",
          subject: "Subject 1",
          message: "Message 1",
          status: "new",
          conversationId: "conv-1",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "test-2",
          name: "User 2",
          email: "user2@example.com",
          subject: "Subject 2",
          message: "Message 2",
          status: "resolved",
          conversationId: "conv-2",
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockSubmissions),
        }),
      } as unknown);

      const result = await getContactSubmissions();

      expect(result.success).toBe(true);
      expect(result.submissions).toEqual(mockSubmissions);
    });

    it("should handle database errors gracefully", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      } as unknown);

      const result = await getContactSubmissions();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Database error");
    });
  });

  describe("updateContactSubmissionStatus", () => {
    it("should update submission status successfully", async () => {
      const mockUpdatedSubmission = {
        id: "test-id",
        status: "resolved",
        notes: "Issue resolved",
        updatedAt: new Date(),
      };

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedSubmission]),
          }),
        }),
      } as unknown);

      const result = await updateContactSubmissionStatus(
        "test-id",
        "resolved",
        "Issue resolved",
      );

      expect(result.success).toBe(true);
      expect(result.submission).toEqual(mockUpdatedSubmission);
    });

    it("should handle database errors gracefully", async () => {
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue(new Error("Database error")),
          }),
        }),
      } as unknown);

      const result = await updateContactSubmissionStatus(
        "test-id",
        "resolved",
        "Issue resolved",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Database error");
    });
  });

  describe("sendFollowUpEmailToUser", () => {
    it("should send follow-up email successfully", async () => {
      const mockSubmission = {
        id: "test-id",
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Test message",
        conversationId: "conv-123",
        notes: "Previous notes",
      };

      const mockUpdatedSubmission = {
        ...mockSubmission,
        notes: "Previous notes\n\n--- Follow-up sent on",
        lastSupportMessageAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSubmission]),
        }),
      } as unknown);

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedSubmission]),
          }),
        }),
      } as unknown);

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: "email-1" }]),
        }),
      } as unknown);

      const result = await sendFollowUpEmailToUser(
        "test-id",
        "Follow-up message",
        "Support Agent",
        "support@example.com",
      );

      expect(result.success).toBe(true);
      expect(result.submission).toEqual(mockUpdatedSubmission);
    });

    it("should create conversation ID if none exists", async () => {
      const mockSubmission = {
        id: "test-id",
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Test message",
        conversationId: null,
        notes: null,
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSubmission]),
        }),
      } as unknown);

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockSubmission]),
          }),
        }),
      } as unknown);

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: "email-1" }]),
        }),
      } as unknown);

      const result = await sendFollowUpEmailToUser(
        "test-id",
        "Follow-up message",
        "Support Agent",
        "support@example.com",
      );

      expect(result.success).toBe(true);
    });

    it("should handle missing submission gracefully", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as unknown);

      const result = await sendFollowUpEmailToUser(
        "non-existent-id",
        "Follow-up message",
        "Support Agent",
        "support@example.com",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Contact submission not found");
    });
  });

  describe("getConversationHistory", () => {
    it("should retrieve conversation history successfully", async () => {
      const mockSubmission = {
        id: "test-id",
        conversationId: "conv-123",
      };

      const mockConversations = [
        {
          id: "conv-1",
          conversationId: "conv-123",
          message: "User message",
          direction: "inbound",
          createdAt: new Date(),
        },
        {
          id: "conv-2",
          conversationId: "conv-123",
          message: "Support response",
          direction: "outbound",
          createdAt: new Date(),
        },
      ];

      // Mock the first select (for submission)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSubmission]),
        }),
      } as unknown);

      // Mock the second select (for conversations)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockConversations),
          }),
        }),
      } as unknown);

      const result = await getConversationHistory("test-id");

      expect(result.success).toBe(true);
      expect(result.conversations).toEqual(mockConversations);
    });

    it("should handle missing submission gracefully", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as unknown);

      const result = await getConversationHistory("non-existent-id");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Submission or conversation not found");
    });
  });

  describe("updateExistingSubmissionsWithConversationIds", () => {
    it("should update existing submissions successfully", async () => {
      const mockSubmissions = [
        { id: "sub-1", conversationId: null },
        { id: "sub-2", conversationId: null },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockSubmissions),
        }),
      } as unknown);

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: "sub-1" }]),
          }),
        }),
      } as unknown);

      const result = await updateExistingSubmissionsWithConversationIds();

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(2);
    });

    it("should handle database errors gracefully", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      } as unknown);

      const result = await updateExistingSubmissionsWithConversationIds();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Database error");
    });
  });
});
