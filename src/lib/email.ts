import AccountInviteEmail from "./email-templates/account-invite";
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
