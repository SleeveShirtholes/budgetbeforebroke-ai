"use server";

import { db } from "@/db/config";
import { supportComments, supportRequests, user } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Fetch comments for a list of support request IDs.
 * @param {string[]} requestIds - The IDs of the support requests.
 * @returns {Array} The comments for the given requests.
 */
export async function getSupportCommentsForRequests(requestIds: string[]) {
  if (!requestIds.length) return [];
  const comments = await db
    .select({
      id: supportComments.id,
      requestId: supportComments.requestId,
      userId: supportComments.userId,
      text: supportComments.text,
      timestamp: supportComments.timestamp,
      userName: user.name, // Join user name from user table
    })
    .from(supportComments)
    .leftJoin(user, eq(supportComments.userId, user.id))
    .where(inArray(supportComments.requestId, requestIds))
    .orderBy(supportComments.timestamp);
  return comments;
}

/**
 * Add a comment to a support request
 * The user's name will be joined from the user table when fetching comments.
 */
export async function addSupportComment({
  requestId,
  text,
  userId,
}: {
  requestId: string;
  text: string;
  userId: string;
}) {
  if (!userId) throw new Error("Not authenticated");
  const comment = {
    id: randomUUID(),
    requestId,
    userId,
    text,
    timestamp: new Date(),
  };
  await db.insert(supportComments).values(comment);
  // Update lastUpdated on the request
  await db
    .update(supportRequests)
    .set({ lastUpdated: new Date() })
    .where(eq(supportRequests.id, requestId));
  return comment;
}
