import { NextRequest, NextResponse } from "next/server";
import { budgetAccountInvitations, budgetAccountMembers } from "@/db/schema";

import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Find the invitation
  const invitation = await db.query.budgetAccountInvitations.findFirst({
    where: eq(budgetAccountInvitations.token, token),
  });

  if (!invitation) {
    return NextResponse.json(
      { error: "Invalid or expired invitation" },
      { status: 404 },
    );
  }

  // Check if the invitation is still pending and not expired
  if (
    invitation.status !== "pending" ||
    new Date(invitation.expiresAt) < new Date()
  ) {
    return NextResponse.json(
      { error: "Invitation is no longer valid" },
      { status: 400 },
    );
  }

  // Check if user is authenticated
  const sessionResult = await auth.api.getSession({ headers: req.headers });
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    // Not authenticated, redirect to sign up with token as query param
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/auth/signup?inviteToken=${token}`);
  }

  // Fetch the authenticated user's email
  const userEmail = sessionResult.user.email;

  // Check if the invitee email matches the authenticated user's email
  if (userEmail !== invitation.inviteeEmail) {
    return NextResponse.json(
      { error: "This invite was not sent to your email address." },
      { status: 403 },
    );
  }

  // Add user to the account as a member
  await db.insert(budgetAccountMembers).values({
    id: nanoid(),
    budgetAccountId: invitation.budgetAccountId,
    userId: sessionResult.user.id,
    role: invitation.role,
    joinedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Mark invitation as accepted
  await db
    .update(budgetAccountInvitations)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(budgetAccountInvitations.id, invitation.id));

  // Redirect to the account page or show a success message
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/account?joined=1&inviteAccepted=1`);
}
