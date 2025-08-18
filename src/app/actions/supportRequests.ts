"use server";

import { db } from "@/db/config";
import { supportRequests, user } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getCurrentUserWithAdmin } from "@/lib/auth-helpers";

/**
 * Fetch all public support requests (optionally filter by status), including comments for each request.
 * Comments are fetched via the supportComments actions.
 */
export async function getPublicSupportRequests(status?: string) {
  const requests = await db
    .select({
      id: supportRequests.id,
      title: supportRequests.title,
      description: supportRequests.description,
      category: supportRequests.category,
      status: supportRequests.status,
      isPublic: supportRequests.isPublic,
      userId: supportRequests.userId,
      upvotes: supportRequests.upvotes,
      downvotes: supportRequests.downvotes,
      lastUpdated: supportRequests.lastUpdated,
      createdAt: supportRequests.createdAt,
      user: user.name,
    })
    .from(supportRequests)
    .leftJoin(user, eq(supportRequests.userId, user.id))
    .where(
      and(
        eq(supportRequests.isPublic, true),
        status === "Closed"
          ? eq(supportRequests.status, "Closed")
          : status === "open"
            ? sql`${supportRequests.status} != 'Closed'`
            : undefined,
      ),
    )
    .orderBy(desc(supportRequests.lastUpdated));
  return requests;
}

/**
 * Fetch all support requests for a user (optionally filter by status), including comments for each request.
 * Comments are fetched via the supportComments actions.
 */
export async function getMySupportRequests(userId: string, status?: string) {
  if (!userId) return [];
  const requests = await db
    .select({
      id: supportRequests.id,
      title: supportRequests.title,
      description: supportRequests.description,
      category: supportRequests.category,
      status: supportRequests.status,
      isPublic: supportRequests.isPublic,
      userId: supportRequests.userId,
      upvotes: supportRequests.upvotes,
      downvotes: supportRequests.downvotes,
      lastUpdated: supportRequests.lastUpdated,
      createdAt: supportRequests.createdAt,
      user: user.name,
    })
    .from(supportRequests)
    .leftJoin(user, eq(supportRequests.userId, user.id))
    .where(
      and(
        eq(supportRequests.userId, userId),
        status === "Closed"
          ? eq(supportRequests.status, "Closed")
          : status === "open"
            ? sql`${supportRequests.status} != 'Closed'`
            : undefined,
      ),
    )
    .orderBy(desc(supportRequests.lastUpdated));
  return requests;
}

/**
 * Fetch all support requests for admin management
 * Only accessible by global admins
 */
export async function getAllSupportRequestsForAdmin(status?: string) {
  const currentUser = await getCurrentUserWithAdmin();
  if (!currentUser?.isGlobalAdmin) {
    throw new Error("Global admin access required");
  }

  const requests = await db
    .select({
      id: supportRequests.id,
      title: supportRequests.title,
      description: supportRequests.description,
      category: supportRequests.category,
      status: supportRequests.status,
      isPublic: supportRequests.isPublic,
      userId: supportRequests.userId,
      upvotes: supportRequests.upvotes,
      downvotes: supportRequests.downvotes,
      lastUpdated: supportRequests.lastUpdated,
      createdAt: supportRequests.createdAt,
      user: user.name,
    })
    .from(supportRequests)
    .leftJoin(user, eq(supportRequests.userId, user.id))
    .where(
      status === "Closed"
        ? eq(supportRequests.status, "Closed")
        : status === "open"
          ? sql`${supportRequests.status} != 'Closed'`
          : undefined,
    )
    .orderBy(desc(supportRequests.lastUpdated));

  return requests;
}

/**
 * Check if a user can edit a support request
 * Only the creator or a global admin can edit
 */
export async function canEditSupportRequest(
  requestId: string,
): Promise<boolean> {
  const currentUser = await getCurrentUserWithAdmin();
  if (!currentUser) return false;

  // Global admins can edit any request
  if (currentUser.isGlobalAdmin) return true;

  // Check if the current user is the creator of the request
  const [request] = await db
    .select({ userId: supportRequests.userId })
    .from(supportRequests)
    .where(eq(supportRequests.id, requestId));

  return request?.userId === currentUser.id;
}

/**
 * Create a new support request.
 * @param {Object} params - The support request data.
 * @returns {Object} The created support request.
 */
export async function createSupportRequest({
  title,
  description,
  category,
  isPublic,
  userId,
}: {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  userId: string;
}) {
  console.log("createSupportRequest called with:", {
    title,
    description,
    category,
    isPublic,
    userId,
  });
  if (!userId)
    throw new Error("Authentication required to create support request");
  const now = new Date();
  const newRequest = {
    id: randomUUID(),
    title,
    description,
    category,
    status: "Open",
    isPublic,
    userId,
    upvotes: 0,
    downvotes: 0,
    lastUpdated: now,
    createdAt: now,
  };
  console.log("Inserting new request:", newRequest);
  await db.insert(supportRequests).values(newRequest);
  console.log("Request inserted successfully");
  return newRequest;
}

/**
 * Upvote a support request
 */
export async function upvoteSupportRequest(requestId: string) {
  await db
    .update(supportRequests)
    .set({ upvotes: sql`${supportRequests.upvotes} + 1` })
    .where(eq(supportRequests.id, requestId));
}

/**
 * Downvote a support request
 */
export async function downvoteSupportRequest(requestId: string) {
  await db
    .update(supportRequests)
    .set({ downvotes: sql`${supportRequests.downvotes} + 1` })
    .where(eq(supportRequests.id, requestId));
}

/**
 * Change the status of a support request
 * Only the creator or a global admin can change status
 */
export async function updateSupportRequestStatus(
  requestId: string,
  status: string,
) {
  const canEdit = await canEditSupportRequest(requestId);
  if (!canEdit) {
    throw new Error("You don't have permission to edit this request");
  }

  await db
    .update(supportRequests)
    .set({ status, lastUpdated: new Date() })
    .where(eq(supportRequests.id, requestId));
}

/**
 * Update a support request (title, description, category, visibility)
 * Only the creator or a global admin can update
 */
export async function updateSupportRequest(
  requestId: string,
  updates: {
    title?: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
  },
) {
  const canEdit = await canEditSupportRequest(requestId);
  if (!canEdit) {
    throw new Error("You don't have permission to edit this request");
  }

  const updateData: {
    title?: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
    lastUpdated?: Date;
  } = { ...updates };
  if (Object.keys(updateData).length > 0) {
    updateData.lastUpdated = new Date();
  }

  await db
    .update(supportRequests)
    .set(updateData)
    .where(eq(supportRequests.id, requestId));
}
