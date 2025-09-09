"use server";

import { db } from "@/db/config";
import { randomUUID } from "crypto";
import { getCurrentUserWithAdmin } from "@/lib/auth-helpers";

/**
 * Fetch all public support requests (optionally filter by status), including comments for each request.
 * Comments are fetched via the supportComments actions.
 */
export async function getPublicSupportRequests(status?: string) {
  const whereClause: Record<string, unknown> = {
    isPublic: true,
  };

  if (status === "Closed") {
    whereClause.status = "Closed";
  } else if (status === "open") {
    whereClause.status = {
      not: "Closed",
    };
  }

  const requests = await db.supportRequest.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      lastUpdated: "desc",
    },
  });

  return requests.map((request) => ({
    id: request.id,
    title: request.title,
    description: request.description,
    category: request.category,
    status: request.status,
    isPublic: request.isPublic,
    userId: request.userId,
    upvotes: request.upvotes,
    downvotes: request.downvotes,
    lastUpdated: request.lastUpdated,
    createdAt: request.createdAt,
    user: request.user.name,
  }));
}

/**
 * Fetch all support requests for a user (optionally filter by status), including comments for each request.
 * Comments are fetched via the supportComments actions.
 */
export async function getMySupportRequests(userId: string, status?: string) {
  if (!userId) return [];

  const whereClause: Record<string, unknown> = {
    userId: userId,
  };

  if (status === "Closed") {
    whereClause.status = "Closed";
  } else if (status === "open") {
    whereClause.status = {
      not: "Closed",
    };
  }

  const requests = await db.supportRequest.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      lastUpdated: "desc",
    },
  });

  return requests.map((request) => ({
    id: request.id,
    title: request.title,
    description: request.description,
    category: request.category,
    status: request.status,
    isPublic: request.isPublic,
    userId: request.userId,
    upvotes: request.upvotes,
    downvotes: request.downvotes,
    lastUpdated: request.lastUpdated,
    createdAt: request.createdAt,
    user: request.user.name,
  }));
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

  const whereClause: Record<string, unknown> = {};

  if (status === "Closed") {
    whereClause.status = "Closed";
  } else if (status === "open") {
    whereClause.status = {
      not: "Closed",
    };
  }

  const requests = await db.supportRequest.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      lastUpdated: "desc",
    },
  });

  return requests.map((request) => ({
    id: request.id,
    title: request.title,
    description: request.description,
    category: request.category,
    status: request.status,
    isPublic: request.isPublic,
    userId: request.userId,
    upvotes: request.upvotes,
    downvotes: request.downvotes,
    lastUpdated: request.lastUpdated,
    createdAt: request.createdAt,
    user: request.user.name,
  }));
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
  const request = await db.supportRequest.findFirst({
    where: {
      id: requestId,
    },
    select: {
      userId: true,
    },
  });

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
  const newRequest = await db.supportRequest.create({
    data: {
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
    },
  });
  console.log("Request inserted successfully");
  return newRequest;
}

/**
 * Upvote a support request
 */
export async function upvoteSupportRequest(requestId: string) {
  await db.supportRequest.update({
    where: {
      id: requestId,
    },
    data: {
      upvotes: {
        increment: 1,
      },
    },
  });
}

/**
 * Downvote a support request
 */
export async function downvoteSupportRequest(requestId: string) {
  await db.supportRequest.update({
    where: {
      id: requestId,
    },
    data: {
      downvotes: {
        increment: 1,
      },
    },
  });
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

  await db.supportRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status,
      lastUpdated: new Date(),
    },
  });
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

  const updateData: Record<string, unknown> = { ...updates };
  if (Object.keys(updateData).length > 0) {
    updateData.lastUpdated = new Date();
  }

  await db.supportRequest.update({
    where: {
      id: requestId,
    },
    data: updateData,
  });
}
