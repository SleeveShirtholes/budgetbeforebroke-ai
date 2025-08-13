import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/config";
import { emailConversations, contactSubmissions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Webhook endpoint for Resend to send incoming emails
 * This allows us to receive replies from users and store them in the conversation thread
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify this is a valid webhook from Resend
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (webhookSecret && body.secret !== webhookSecret) {
      console.error("Invalid webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle different webhook types
    if (body.type === "email.delivered" || body.type === "email.bounced") {
      // Handle delivery status updates if needed
      return NextResponse.json({ success: true });
    }

    if (body.type === "email.received") {
      const email = body.data;

      // Extract email details
      const fromEmail = email.from;
      const fromName = email.from_name || fromEmail.split("@")[0];
      const toEmail = email.to[0]; // Usually the first recipient
      const subject = email.subject;
      const message = email.text || email.html || "No message content";
      const messageId = email.id;

      // Try to find the conversation this email belongs to
      // Look for the conversation ID in the subject or message headers
      let conversationId = extractConversationId(
        subject,
        message,
        email.headers,
      );

      if (!conversationId) {
        // If no conversation ID found, try to match by email
        conversationId = await findConversationByEmailAndSubject(fromEmail);
      }

      if (conversationId) {
        // Store the incoming email in the conversation
        await db.insert(emailConversations).values({
          conversationId,
          messageId,
          fromEmail,
          fromName,
          toEmail,
          subject,
          message,
          messageType: "user_reply",
          direction: "inbound",
          rawEmail: JSON.stringify(email),
        });

        // Update the contact submission with the last user message time
        await db
          .update(contactSubmissions)
          .set({
            lastUserMessageAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(contactSubmissions.conversationId, conversationId));

        console.log(
          `Stored incoming email for conversation: ${conversationId}`,
        );
      } else {
        console.log(
          `Could not associate incoming email with existing conversation: ${fromEmail} - ${subject}`,
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Extract conversation ID from email subject or message
 * We'll embed this in our outgoing emails so we can track conversations
 */
function extractConversationId(
  subject: string,
  message: string,
  headers: Record<string, string> | undefined,
): string | null {
  // Look for conversation ID in subject (e.g., "Re: [CONV-123] Original Subject")
  const subjectMatch = subject.match(/\[CONV-([a-zA-Z0-9]+)\]/);
  if (subjectMatch) {
    return subjectMatch[1];
  }

  // Look for conversation ID in message body
  const messageMatch = message.match(/Conversation ID: ([a-zA-Z0-9]+)/);
  if (messageMatch) {
    return messageMatch[1];
  }

  // Look for conversation ID in email headers
  if (headers && headers["x-conversation-id"]) {
    return headers["x-conversation-id"];
  }

  return null;
}

/**
 * Try to find a conversation by matching email and subject
 * This is a fallback when conversation ID is not available
 */
async function findConversationByEmailAndSubject(
  fromEmail: string,
): Promise<string | null> {
  try {
    // Look for submissions from this email address
    const submissions = await db
      .select({ conversationId: contactSubmissions.conversationId })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.email, fromEmail))
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(1);

    if (submissions.length > 0) {
      return submissions[0].conversationId;
    }

    return null;
  } catch (error) {
    console.error("Error finding conversation by email:", error);
    return null;
  }
}
