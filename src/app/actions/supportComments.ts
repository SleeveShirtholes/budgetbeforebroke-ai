"use server";

import { db } from "@/db/config";
import { randomUUID } from "crypto";

/**
 * Fetch comments for a list of support request IDs.
 * @param {string[]} requestIds - The IDs of the support requests.
 * @returns {Array} The comments for the given requests.
 */
export async function getSupportCommentsForRequests(requestIds: string[]) {
  if (!requestIds.length) return [];

  const comments = await db.supportComment.findMany({
    where: {
      requestId: {
        in: requestIds,
      },
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  return comments.map((comment) => ({
    id: comment.id,
    requestId: comment.requestId,
    userId: comment.userId,
    text: comment.text,
    timestamp: comment.timestamp,
    userName: comment.user.name,
  }));
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

  const comment = await db.supportComment.create({
    data: {
      id: randomUUID(),
      requestId,
      userId,
      text,
      timestamp: new Date(),
    },
  });

  // Update lastUpdated on the request
  await db.supportRequest.update({
    where: { id: requestId },
    data: { lastUpdated: new Date() },
  });

  return comment;
}
