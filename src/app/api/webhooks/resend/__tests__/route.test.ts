import { POST } from "../route";
import { db } from "@/db/config";

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: jest.fn().mockResolvedValue(data),
    })),
  },
}));

// Mock the database with Prisma-style mocks
jest.mock("@/db/config", () => ({
  db: {
    emailConversation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    contactSubmission: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockDb = db as jest.Mocked<typeof db>;

describe("Resend Webhook Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default environment variable
    process.env.RESEND_WEBHOOK_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.RESEND_WEBHOOK_SECRET;
  });

  describe("POST /api/webhooks/resend", () => {
    it("should handle email.delivered webhook successfully", async () => {
      const webhookData = {
        type: "email.delivered",
        secret: "test-secret",
        data: { id: "email-123" },
      };

      const request = {
        json: jest.fn().mockResolvedValue(webhookData),
      } as unknown;

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it("should handle email.bounced webhook successfully", async () => {
      const webhookData = {
        type: "email.bounced",
        secret: "test-secret",
        data: { id: "email-123" },
      };

      const request = {
        json: jest.fn().mockResolvedValue(webhookData),
      } as unknown;

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it("should process email.received webhook successfully", async () => {
      const webhookData = {
        type: "email.received",
        secret: "test-secret",
        data: {
          id: "email-123",
          from: "user@example.com",
          from_name: "Test User",
          to: ["support@example.com"],
          subject: "Re: [CONV-123] Test Subject",
          text: "This is a reply",
          headers: {},
        },
      };

      // Mock database operations
      mockDb.emailConversation.create.mockResolvedValue({
        id: "conv-1",
      });
      mockDb.contactSubmission.updateMany.mockResolvedValue({
        count: 1,
      });

      const request = {
        json: jest.fn().mockResolvedValue(webhookData),
      } as unknown;

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it("should handle webhook without secret when not configured", async () => {
      delete process.env.RESEND_WEBHOOK_SECRET;

      const webhookData = {
        type: "email.received",
        data: {
          id: "email-123",
          from: "user@example.com",
          to: ["support@example.com"],
          subject: "Test Subject",
          text: "This is a reply",
        },
      };

      const request = {
        json: jest.fn().mockResolvedValue(webhookData),
      } as unknown;

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it("should reject webhook with invalid secret", async () => {
      const webhookData = {
        type: "email.received",
        secret: "wrong-secret",
        data: {
          id: "email-123",
          from: "user@example.com",
          to: ["support@example.com"],
          subject: "Test Subject",
          text: "This is a reply",
        },
      };

      const request = {
        json: jest.fn().mockResolvedValue(webhookData),
      } as unknown;

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe("Unauthorized");
    });

    it("should handle database errors gracefully", async () => {
      const webhookData = {
        type: "email.received",
        secret: "test-secret",
        data: {
          id: "email-123",
          from: "user@example.com",
          to: ["support@example.com"],
          subject: "Test Subject", // No conversation ID in subject
          text: "This is a reply",
          headers: {},
        },
      };

      // Mock the fallback function to fail with a database error
      // This will cause the function to return null, but the webhook should still succeed
      mockDb.contactSubmission.findFirst.mockRejectedValue(
        new Error("Database error"),
      );

      const request = {
        json: jest.fn().mockResolvedValue(webhookData),
      } as unknown;

      const response = await POST(request);
      const responseData = await response.json();

      // The webhook should handle the error gracefully and still return success
      // because the fallback function catches its own errors
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it("should extract conversation ID from subject line", async () => {
      const webhookData = {
        type: "email.received",
        secret: "test-secret",
        data: {
          id: "email-123",
          from: "user@example.com",
          to: ["support@example.com"],
          subject: "Re: [CONV-abc123] Test Subject",
          text: "This is a reply",
          headers: {},
        },
      };

      mockDb.emailConversation.create.mockResolvedValue({
        id: "conv-1",
      });
      mockDb.contactSubmission.updateMany.mockResolvedValue({
        count: 1,
      });

      const request = {
        json: jest.fn().mockResolvedValue(webhookData),
      } as unknown;

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it("should fall back to email matching when no conversation ID found", async () => {
      const webhookData = {
        type: "email.received",
        secret: "test-secret",
        data: {
          id: "email-123",
          from: "user@example.com",
          to: ["support@example.com"],
          subject: "Test Subject",
          text: "This is a reply",
          headers: {},
        },
      };

      // Mock finding submission by email
      mockDb.contactSubmission.findFirst.mockResolvedValue({
        conversationId: "conv-456",
      });

      mockDb.emailConversation.create.mockResolvedValue({
        id: "conv-1",
      });
      mockDb.contactSubmission.updateMany.mockResolvedValue({
        count: 1,
      });

      const request = {
        json: jest.fn().mockResolvedValue(webhookData),
      } as unknown;

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });
  });
});
