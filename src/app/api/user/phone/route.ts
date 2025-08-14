import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/config";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatPhoneNumber, sendSms } from "@/lib/twilio";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<
  string,
  { code: string; expires: Date; userId: string }
>();

/**
 * Add phone number to user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, userId } = body;

    if (!phoneNumber || !userId) {
      return NextResponse.json(
        { error: "Phone number and user ID are required" },
        { status: 400 },
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Check if phone number is already in use
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.phoneNumber, formattedPhone))
      .limit(1);

    if (existingUser[0] && existingUser[0].id !== userId) {
      return NextResponse.json(
        {
          error: "This phone number is already associated with another account",
        },
        { status: 409 },
      );
    }

    // Generate verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code
    verificationCodes.set(formattedPhone, {
      code: verificationCode,
      expires,
      userId,
    });

    // Send SMS verification
    const message = `Your Budget Before Broke verification code is: ${verificationCode}. This code expires in 10 minutes.`;
    const smsSent = await sendSms(formattedPhone, message);

    if (!smsSent) {
      return NextResponse.json(
        { error: "Failed to send verification SMS" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Verification code sent to your phone",
      phoneNumber: formattedPhone,
    });
  } catch (error) {
    console.error("Error adding phone number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Verify phone number with code
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, verificationCode, userId } = body;

    if (!phoneNumber || !verificationCode || !userId) {
      return NextResponse.json(
        { error: "Phone number, verification code, and user ID are required" },
        { status: 400 },
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const storedVerification = verificationCodes.get(formattedPhone);

    if (!storedVerification) {
      return NextResponse.json(
        { error: "No verification code found for this phone number" },
        { status: 404 },
      );
    }

    if (storedVerification.userId !== userId) {
      return NextResponse.json(
        { error: "Verification code does not match user" },
        { status: 403 },
      );
    }

    if (new Date() > storedVerification.expires) {
      verificationCodes.delete(formattedPhone);
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 410 },
      );
    }

    if (storedVerification.code !== verificationCode) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 },
      );
    }

    // Update user's phone number
    await db
      .update(user)
      .set({
        phoneNumber: formattedPhone,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // Clean up verification code
    verificationCodes.delete(formattedPhone);

    // Send welcome SMS
    const welcomeMessage = `🎉 Phone verified! You can now text this number to:

📝 Add transactions: "Spent $25 on groceries"
💰 Check budgets: "Budget groceries" 
❓ Get help: "help"

Welcome to SMS budgeting!`;

    await sendSms(formattedPhone, welcomeMessage);

    return NextResponse.json({
      message: "Phone number verified successfully",
      phoneNumber: formattedPhone,
    });
  } catch (error) {
    console.error("Error verifying phone number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Remove phone number from user account
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    await db
      .update(user)
      .set({
        phoneNumber: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    return NextResponse.json({ message: "Phone number removed successfully" });
  } catch (error) {
    console.error("Error removing phone number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
