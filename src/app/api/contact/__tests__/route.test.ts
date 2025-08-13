import { POST } from "../route";
import { sendContactConfirmation, sendSupportNotification } from "@/lib/email";
import { createContactSubmission } from "@/app/actions/contact";
import { NextRequest } from "next/server";

// Mock the email functions
jest.mock("@/lib/email", () => ({
  sendContactConfirmation: jest.fn(),
  sendSupportNotification: jest.fn(),
}));

// Mock the database action
jest.mock("@/app/actions/contact", () => ({
  createContactSubmission: jest.fn(),
}));

const mockSendContactConfirmation =
  sendContactConfirmation as jest.MockedFunction<
    typeof sendContactConfirmation
  >;

const mockSendSupportNotification =
  sendSupportNotification as jest.MockedFunction<
    typeof sendSupportNotification
  >;

const mockCreateContactSubmission =
  createContactSubmission as jest.MockedFunction<
    typeof createContactSubmission
  >;

// Mock NextRequest
jest.mock("next/server", () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    json: jest.fn(),
    headers: {
      get: jest.fn((key) => {
        if (key === "x-forwarded-for") return "127.0.0.1";
        if (key === "x-real-ip") return "127.0.0.1";
        return null;
      }),
    },
    ...init,
  })),
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: jest.fn().mockResolvedValue(data),
    })),
  },
}));

describe("Contact API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful database response
    mockCreateContactSubmission.mockResolvedValue({
      success: true,
      submission: {
        id: "test-submission-id",
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message:
          "This is a test message that is long enough to meet the minimum requirement.",
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Test Browser)",
        status: "new",
        conversationId: "test-conversation-id",
        lastUserMessageAt: null,
        lastSupportMessageAt: null,
        assignedTo: null,
        notes: null,
        resolvedAt: null,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      },
    });
  });

  const createMockRequest = (body: Record<string, string>) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      headers: {
        get: jest.fn((key: string) => {
          if (key === "x-forwarded-for") return "127.0.0.1";
          if (key === "x-real-ip") return "127.0.0.1";
          if (key === "user-agent") return "Mozilla/5.0 (Test Browser)";
          return null;
        }),
      },
    } as unknown as NextRequest;
  };

  describe("POST /api/contact", () => {
    it("should successfully process a valid contact form submission, save to database, and send emails", async () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message:
          "This is a test message that is long enough to meet the minimum requirement.",
      };

      mockSendContactConfirmation.mockResolvedValue({ id: "test-email-id" });
      mockSendSupportNotification.mockResolvedValue({
        id: "test-notification-id",
      });

      const request = createMockRequest(validData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toContain(
        "Check your email for a confirmation",
      );
      expect(responseData.submissionId).toBe("test-submission-id");

      // Check that database was called
      expect(mockCreateContactSubmission).toHaveBeenCalledWith({
        ...validData,
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Test Browser)",
      });

      // Check that confirmation email was sent
      expect(mockSendContactConfirmation).toHaveBeenCalledWith({
        to: validData.email,
        name: validData.name,
        subject: validData.subject,
        message: validData.message,
      });

      // Check that support notification was sent
      expect(mockSendSupportNotification).toHaveBeenCalledWith({
        submissionId: "test-submission-id",
        name: validData.name,
        email: validData.email,
        subject: validData.subject,
        message: validData.message,
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Test Browser)",
        timestamp: expect.any(String),
      });
    });

    it("should handle database save failure gracefully", async () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message:
          "This is a test message that is long enough to meet the minimum requirement.",
      };

      mockCreateContactSubmission.mockResolvedValue({
        success: false,
        error: "Database connection failed",
      });

      const request = createMockRequest(validData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toContain("Failed to save your message");
      expect(mockSendContactConfirmation).not.toHaveBeenCalled();
      expect(mockSendSupportNotification).not.toHaveBeenCalled();
    });

    it("should handle email sending failure gracefully", async () => {
      const validData = {
        name: "Jane Doe",
        email: "jane@example.com",
        subject: "Test Subject",
        message:
          "This is a test message that is long enough to meet the minimum requirement.",
      };

      mockSendContactConfirmation.mockRejectedValue(
        new Error("Email service down"),
      );
      mockSendSupportNotification.mockRejectedValue(
        new Error("Notification service down"),
      );

      const request = createMockRequest(validData);
      const response = await POST(request);
      const responseData = await response.json();

      // Should still succeed even if emails fail
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(mockCreateContactSubmission).toHaveBeenCalled();
      expect(mockSendContactConfirmation).toHaveBeenCalled();
      expect(mockSendSupportNotification).toHaveBeenCalled();
    });

    it("should return 400 for invalid email", async () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
        subject: "Test Subject",
        message:
          "This is a test message that is long enough to meet the minimum requirement.",
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("Please check your form data");
      expect(mockCreateContactSubmission).not.toHaveBeenCalled();
      expect(mockSendContactConfirmation).not.toHaveBeenCalled();
      expect(mockSendSupportNotification).not.toHaveBeenCalled();
    });

    it("should return 400 for missing required fields", async () => {
      const invalidData = {
        name: "",
        email: "john@example.com",
        subject: "Test Subject",
        message:
          "This is a test message that is long enough to meet the minimum requirement.",
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("Please check your form data");
      expect(mockCreateContactSubmission).not.toHaveBeenCalled();
      expect(mockSendContactConfirmation).not.toHaveBeenCalled();
      expect(mockSendSupportNotification).not.toHaveBeenCalled();
    });

    it("should return 400 for message that is too short", async () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Too short",
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("Please check your form data");
      expect(mockCreateContactSubmission).not.toHaveBeenCalled();
      expect(mockSendContactConfirmation).not.toHaveBeenCalled();
      expect(mockSendSupportNotification).not.toHaveBeenCalled();
    });

    it("should return 400 for message that is too long", async () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "a".repeat(2001), // Exceeds 2000 character limit
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("Please check your form data");
      expect(mockCreateContactSubmission).not.toHaveBeenCalled();
      expect(mockSendContactConfirmation).not.toHaveBeenCalled();
      expect(mockSendSupportNotification).not.toHaveBeenCalled();
    });

    it("should return 400 for subject that is too long", async () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "a".repeat(201), // Exceeds 200 character limit
        message:
          "This is a test message that is long enough to meet the minimum requirement.",
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("Please check your form data");
      expect(mockCreateContactSubmission).not.toHaveBeenCalled();
      expect(mockSendContactConfirmation).not.toHaveBeenCalled();
      expect(mockSendSupportNotification).not.toHaveBeenCalled();
    });
  });
});
