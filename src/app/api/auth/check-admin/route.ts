import { NextResponse } from "next/server";
import { getCurrentUserWithAdmin } from "@/lib/auth-helpers";

/**
 * API route to check if the current user is a global admin
 * GET /api/auth/check-admin
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUserWithAdmin();

    if (!currentUser) {
      return NextResponse.json({ isGlobalAdmin: false }, { status: 401 });
    }

    return NextResponse.json({
      isGlobalAdmin: currentUser.isGlobalAdmin,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isGlobalAdmin: false }, { status: 500 });
  }
}
