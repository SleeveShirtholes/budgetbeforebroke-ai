import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactConfirmation, sendSupportNotification } from "@/lib/email";
import { createContactSubmission } from "@/app/actions/contact";

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
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the form data
    const validatedData = contactFormSchema.parse(body);

    // Get IP address and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = request.headers.get("user-agent") || undefined;

    // Save to database
    const dbResult = await createContactSubmission({
      ...validatedData,
      ipAddress,
      userAgent,
    });

    if (!dbResult.success || !dbResult.submission) {
      console.error("Failed to save contact submission:", dbResult.error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save your message. Please try again later.",
        },
        { status: 500 },
      );
    }

    const submission = dbResult.submission;

    // Log the contact form submission
    console.log("Contact form submission saved:", {
      id: submission.id,
      ...validatedData,
      timestamp: submission.createdAt,
      ip: ipAddress,
    });

    // Send confirmation email to the user
    let confirmationEmailSent = true;
    try {
      await sendContactConfirmation({
        to: validatedData.email,
        name: validatedData.name,
        subject: validatedData.subject,
        message: validatedData.message,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      confirmationEmailSent = false;
      // Don't fail the entire request if email fails, just log it
    }

    // Send notification email to support team
    let supportNotificationSent = true;
    try {
      await sendSupportNotification({
        submissionId: submission.id,
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        ipAddress,
        userAgent,
        timestamp: submission.createdAt.toISOString(),
      });
    } catch (notificationError) {
      console.error("Failed to send support notification:", notificationError);
      supportNotificationSent = false;
      // Don't fail the entire request if notification fails, just log it
    }

    // Prepare response message based on email status
    let responseMessage =
      "Thank you for your message! We'll get back to you within 24 hours.";
    if (!confirmationEmailSent) {
      responseMessage +=
        " Note: We couldn't send a confirmation email, but your message was received.";
    }
    responseMessage += " Check your email for a confirmation.";

    return NextResponse.json(
      {
        success: true,
        message: responseMessage,
        submissionId: submission.id,
        confirmationEmailSent,
        supportNotificationSent,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check your form data",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 },
    );
  }
}
