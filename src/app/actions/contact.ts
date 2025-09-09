"use server";

import { db } from "@/db/config";
import { z } from "zod";
import { generateConversationId } from "@/lib/utils";
import { randomUUID } from "crypto";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

/**
 * Creates a new contact form submission in the database
 */
export async function createContactSubmission(
  data: z.infer<typeof contactFormSchema>,
) {
  try {
    // Validate the input data
    const validatedData = contactFormSchema.parse(data);

    // Insert the contact submission into the database
    const submission = await db.contactSubmission.create({
      data: {
        id: randomUUID(),
        conversationId: randomUUID(),
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        ipAddress: validatedData.ipAddress,
        userAgent: validatedData.userAgent,
        status: "new",
      },
    });

    if (!submission) {
      throw new Error("Failed to create contact submission");
    }

    return { success: true, submission };
  } catch (error) {
    console.error("Error creating contact submission:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Retrieves all contact submissions (for admin use)
 */
export async function getContactSubmissions() {
  try {
    const submissions = await db.contactSubmission.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, submissions };
  } catch (error) {
    console.error("Error retrieving contact submissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Updates the status of a contact submission
 */
export async function updateContactSubmissionStatus(
  submissionId: string,
  status: "new" | "in_progress" | "resolved" | "closed",
  notes?: string,
) {
  try {
    const updatedSubmission = await db.contactSubmission.update({
      where: {
        id: submissionId,
      },
      data: {
        status,
        notes,
        updatedAt: new Date(),
        resolvedAt: status === "resolved" ? new Date() : undefined,
      },
    });

    if (!updatedSubmission) {
      throw new Error("Contact submission not found");
    }

    return { success: true, submission: updatedSubmission };
  } catch (error) {
    console.error("Error updating contact submission status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sends a follow-up email to a user from the support team
 */
export async function sendFollowUpEmailToUser(
  submissionId: string,
  message: string,
  supportName: string,
  supportEmail: string,
) {
  try {
    // First, get the submission to find the conversation ID
    const submission = await db.contactSubmission.findFirst({
      where: {
        id: submissionId,
      },
    });

    if (!submission) {
      throw new Error("Contact submission not found");
    }

    // If no conversation ID exists, create one and update the submission
    let conversationId = submission.conversationId;
    if (!conversationId) {
      conversationId = generateConversationId();
      await db.contactSubmission.update({
        where: {
          id: submissionId,
        },
        data: {
          conversationId,
          updatedAt: new Date(),
        },
      });
    }

    // Import the email function dynamically to avoid client-side issues
    const { sendFollowUpEmail } = await import("@/lib/email");

    // Store the support response in the conversation
    await db.emailConversation.create({
      data: {
        id: randomUUID(),
        conversationId: conversationId!,
        messageId: `support-${Date.now()}`,
        fromEmail: supportEmail,
        fromName: supportName,
        toEmail: submission.email,
        subject: submission.subject,
        message,
        messageType: "support_response",
        direction: "outbound",
      },
    });

    // Send the follow-up email
    await sendFollowUpEmail({
      to: submission.email,
      name: submission.name,
      subject: submission.subject,
      message,
      supportName,
      supportEmail,
      conversationId: conversationId!,
    });

    // Update the submission with the follow-up message
    const updatedSubmission = await db.contactSubmission.update({
      where: {
        id: submissionId,
      },
      data: {
        notes: submission.notes
          ? `${submission.notes}\n\n--- Follow-up sent on ${new Date().toISOString()} ---\n${message}`
          : `--- Follow-up sent on ${new Date().toISOString()} ---\n${message}`,
        lastSupportMessageAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { success: true, submission: updatedSubmission };
  } catch (error) {
    console.error("Error sending follow-up email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Retrieves the full conversation history for a contact submission
 */
export async function getConversationHistory(submissionId: string) {
  try {
    // First get the submission to find the conversation ID
    const submission = await db.contactSubmission.findFirst({
      where: {
        id: submissionId,
      },
    });

    if (!submission || !submission.conversationId) {
      return { success: false, error: "Submission or conversation not found" };
    }

    // Get all messages in the conversation, ordered by creation time
    const conversations = await db.emailConversation.findMany({
      where: {
        conversationId: submission.conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return { success: true, conversations, submission };
  } catch (error) {
    console.error("Error retrieving conversation history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Updates all existing contact submissions to have conversation IDs
 * This is a one-time migration function for existing data
 */
export async function updateExistingSubmissionsWithConversationIds() {
  try {
    // Get all submissions without conversation IDs
    // Get all submissions and filter those without conversation IDs
    const allSubmissions = await db.contactSubmission.findMany();
    const submissionsWithoutConversationId = allSubmissions.filter(
      (submission) => !submission.conversationId,
    );

    let updatedCount = 0;

    for (const submission of submissionsWithoutConversationId) {
      const conversationId = generateConversationId();

      await db.contactSubmission.update({
        where: {
          id: submission.id,
        },
        data: {
          conversationId,
          updatedAt: new Date(),
        },
      });

      updatedCount++;
    }

    return {
      success: true,
      message: `Updated ${updatedCount} submissions with conversation IDs`,
      updatedCount,
    };
  } catch (error) {
    console.error("Error updating submissions with conversation IDs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
