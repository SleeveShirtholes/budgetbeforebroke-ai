/**
 * Authentication helper functions for admin and user verification
 */

"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema";

/**
 * Gets the current authenticated user session
 */
export async function getCurrentUser() {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
      return null;
    }

    return sessionResult.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Gets the current authenticated user with full database information including admin status
 */
export async function getCurrentUserWithAdmin() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser?.id) {
      return null;
    }

    // Fetch full user data including admin status
    const [fullUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, sessionUser.id));

    return fullUser || null;
  } catch (error) {
    console.error("Error getting current user with admin status:", error);
    return null;
  }
}

/**
 * Checks if the current user is a global admin
 */
export async function isCurrentUserGlobalAdmin(): Promise<boolean> {
  try {
    const currentUser = await getCurrentUserWithAdmin();
    return currentUser?.isGlobalAdmin ?? false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Requires the current user to be authenticated and returns user info
 * Throws an error if not authenticated
 */
export async function requireAuth() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Authentication required");
  }
  return currentUser;
}

/**
 * Requires the current user to be a global admin
 * Throws an error if not authenticated or not an admin
 */
export async function requireGlobalAdmin() {
  const currentUser = await getCurrentUserWithAdmin();
  if (!currentUser) {
    throw new Error("Authentication required");
  }
  if (!currentUser.isGlobalAdmin) {
    throw new Error("Global admin access required");
  }
  return currentUser;
}
