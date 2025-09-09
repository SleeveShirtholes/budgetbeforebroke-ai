import {
  createContactSubmission,
  getContactSubmissions,
  updateContactSubmissionStatus,
  sendFollowUpEmailToUser,
  getConversationHistory,
  updateExistingSubmissionsWithConversationIds,
} from "../contact";
import { db } from "@/db/config";

// Mock the database config first
jest.mock("@/db/config", () => ({
  db: {
    contactSubmission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    emailConversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

// Get the mocked db for type safety
const mockDb = db as jest.Mocked<typeof db>;

// Mock the email module
jest.mock("@/lib/email", () => ({
  sendFollowUpEmail: jest.fn().mockResolvedValue({ success: true }),
}));

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

      mockDb.contactSubmission.create.mockResolvedValue(mockSubmission);

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
      mockDb.contactSubmission.create.mockRejectedValue(
        new Error("Database error"),
      );

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

      mockDb.contactSubmission.findMany.mockResolvedValue(mockSubmissions);

      const result = await getContactSubmissions();

      expect(result.success).toBe(true);
      expect(result.submissions).toEqual(mockSubmissions);
    });

    it("should handle database errors gracefully", async () => {
      mockDb.contactSubmission.findMany.mockRejectedValue(
        new Error("Database error"),
      );

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

      mockDb.contactSubmission.update.mockResolvedValue(mockUpdatedSubmission);

      const result = await updateContactSubmissionStatus(
        "test-id",
        "resolved",
        "Issue resolved",
      );

      expect(result.success).toBe(true);
      expect(result.submission).toEqual(mockUpdatedSubmission);
    });

    it("should handle database errors gracefully", async () => {
      mockDb.contactSubmission.update.mockRejectedValue(
        new Error("Database error"),
      );

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
      mockDb.contactSubmission.findFirst.mockResolvedValue(mockSubmission);
      mockDb.contactSubmission.update.mockResolvedValue(mockUpdatedSubmission);
      mockDb.emailConversation.create.mockResolvedValue({
        id: "email-1",
      });

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

      mockDb.contactSubmission.findFirst.mockResolvedValue(mockSubmission);
      mockDb.contactSubmission.update.mockResolvedValue(mockSubmission);
      mockDb.emailConversation.create.mockResolvedValue({
        id: "email-1",
      });

      const result = await sendFollowUpEmailToUser(
        "test-id",
        "Follow-up message",
        "Support Agent",
        "support@example.com",
      );

      expect(result.success).toBe(true);
    });

    it("should handle missing submission gracefully", async () => {
      mockDb.contactSubmission.findFirst.mockResolvedValue(null);

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

      // Mock the database queries
      mockDb.contactSubmission.findFirst.mockResolvedValue(mockSubmission);
      mockDb.emailConversation.findMany.mockResolvedValue(mockConversations);

      const result = await getConversationHistory("test-id");

      expect(result.success).toBe(true);
      expect(result.conversations).toEqual(mockConversations);
    });

    it("should handle missing submission gracefully", async () => {
      mockDb.contactSubmission.findFirst.mockResolvedValue(null);

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

      mockDb.contactSubmission.findMany.mockResolvedValue(mockSubmissions);
      mockDb.contactSubmission.update.mockResolvedValue({ id: "sub-1" });

      const result = await updateExistingSubmissionsWithConversationIds();

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(2);
    });

    it("should handle database errors gracefully", async () => {
      mockDb.contactSubmission.findMany.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await updateExistingSubmissionsWithConversationIds();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Database error");
    });
  });
});
