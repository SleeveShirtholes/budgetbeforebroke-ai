import AccountInviteEmail from "./email-templates/account-invite";
import ContactConfirmationEmail from "./email-templates/contact-confirmation";
import SupportNotificationEmail from "./email-templates/support-notification";
import FollowUpEmail from "./email-templates/follow-up-email";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAccountInvite({
  to,
  inviterName,
  accountName,
  token,
}: {
  to: string;
  inviterName: string;
  accountName: string;
  token: string;
}) {
  try {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/invite/accept?token=${token}`;
    const { data, error } = await resend.emails.send({
      from: "Budget Before Broke <noreply@verification.budgetbeforebroke.com>",
      to,
      subject: `You've been invited to join ${accountName}`,
      react: AccountInviteEmail({ inviterName, accountName, inviteUrl }),
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Failed to send invitation email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send invitation email: ${error.message}`);
    }
    throw new Error("Failed to send invitation email: Unknown error");
  }
}

/**
 * Sends a contact confirmation email to the user who submitted the contact form
 */
export async function sendContactConfirmation({
  to,
  name,
  subject,
  message,
}: {
  to: string;
  name: string;
  subject: string;
  message: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Budget Before Broke <noreply@verification.budgetbeforebroke.com>",
      to,
      subject: `We've received your message: ${subject}`,
      react: ContactConfirmationEmail({ name, subject, message }),
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(
        `Failed to send contact confirmation email: ${error.message}`,
      );
    }

    return data;
  } catch (error) {
    console.error("Error sending contact confirmation email:", error);
    if (error instanceof Error) {
      throw new Error(
        `Failed to send contact confirmation email: ${error.message}`,
      );
    }
    throw new Error("Failed to send contact confirmation email: Unknown error");
  }
}

/**
 * Sends a notification email to the support team about a new contact form submission
 */
export async function sendSupportNotification({
  submissionId,
  name,
  email,
  subject,
  message,
  ipAddress,
  userAgent,
  timestamp,
}: {
  submissionId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}) {
  try {
    // Get support team email from environment variable, fallback to a default
    const supportEmail =
      process.env.SUPPORT_TEAM_EMAIL || "support@budgetbeforebroke.com";

    const { data, error } = await resend.emails.send({
      from: "Budget Before Broke <noreply@verification.budgetbeforebroke.com>",
      to: supportEmail,
      subject: `[Contact Form] ${subject} - ${name}`,
      react: SupportNotificationEmail({
        submissionId,
        name,
        email,
        subject,
        message,
        ipAddress,
        userAgent,
        timestamp,
      }),
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(
        `Failed to send support notification email: ${error.message}`,
      );
    }

    return data;
  } catch (error) {
    console.error("Error sending support notification email:", error);
    if (error instanceof Error) {
      throw new Error(
        `Failed to send support notification email: ${error.message}`,
      );
    }
    throw new Error("Failed to send support notification email: Unknown error");
  }
}

/**
 * Sends a follow-up email to a user from the support team
 */
export async function sendFollowUpEmail({
  to,
  name,
  subject,
  message,
  supportName,
  supportEmail,
  conversationId,
}: {
  to: string;
  name: string;
  subject: string;
  message: string;
  supportName: string;
  supportEmail: string;
  conversationId: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Budget Before Broke <noreply@verification.budgetbeforebroke.com>",
      to,
      subject: `Re: ${subject}`,
      react: FollowUpEmail({
        name,
        subject,
        message,
        supportName,
        supportEmail,
        conversationId,
      }),
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Failed to send follow-up email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error sending follow-up email:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send follow-up email: ${error.message}`);
    }
    throw new Error("Failed to send follow-up email: Unknown error");
  }
}
