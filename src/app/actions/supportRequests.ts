"use server";

import { db } from "@/db/config";
import { supportRequests, user } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

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
        status ? eq(supportRequests.status, status) : undefined,
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
        status ? eq(supportRequests.status, status) : undefined,
      ),
    )
    .orderBy(desc(supportRequests.lastUpdated));
  return requests;
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
  await db.insert(supportRequests).values(newRequest);
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
 */
export async function updateSupportRequestStatus(
  requestId: string,
  status: string,
) {
  await db
    .update(supportRequests)
    .set({ status, lastUpdated: new Date() })
    .where(eq(supportRequests.id, requestId));
}
