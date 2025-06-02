/**
 * Server-side actions for managing budget accounts and their members.
 * @module account
 */

"use server";

import {
  budgetAccountInvitations,
  budgetAccountMembers,
  budgetAccounts,
  user,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/config";
import { auth } from "@/lib/auth";
import { sendAccountInvite } from "@/lib/email";
import { randomUUID } from "crypto";
import type { InferSelectModel } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Represents a budget account with its members and invitations
 */
export type AccountWithMembers = {
  id: string;
  name: string;
  description: string | null;
  accountNumber: string;
  members: {
    id: string;
    userId: string;
    role: string;
    user: {
      name: string;
      email: string;
      image: string | null;
    };
  }[];
  invitations: {
    id: string;
    inviteeEmail: string;
    role: string;
    status: string;
    createdAt: Date;
  }[];
};

/**
 * Represents a member with optional user information
 */
type MemberWithMaybeUser = InferSelectModel<typeof budgetAccountMembers> & {
  user?: {
    name?: string;
    email?: string;
    image?: string | null;
  };
};

/**
 * Represents an account with its related members and invitations
 */
type AccountWithRelations = InferSelectModel<typeof budgetAccounts> & {
  members: MemberWithMaybeUser[];
  invitations: InferSelectModel<typeof budgetAccountInvitations>[];
};

/**
 * Maps an account with relations to the AccountWithMembers type
 * @param account - The account with its relations
 * @returns The mapped account with members
 */
function mapAccountToType(account: AccountWithRelations): AccountWithMembers {
  return {
    id: account.id,
    name: account.name,
    description: account.description,
    accountNumber: account.accountNumber,
    members: account.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      user: {
        name: member.user?.name ?? "",
        email: member.user?.email ?? "",
        image: member.user?.image ?? null,
      },
    })),
    invitations: account.invitations.map((invitation) => ({
      id: invitation.id,
      inviteeEmail: invitation.inviteeEmail,
      role: invitation.role,
      status: invitation.status,
      createdAt: invitation.createdAt,
    })),
  };
}

/**
 * Retrieves all accounts where the current user is a member
 * @returns Promise resolving to an array of accounts with their members and invitations
 * @throws {Error} If user is not authenticated
 */
export async function getAccounts() {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get all accounts where the user is a member, including members and invitations
  const accountMemberships = await db.query.budgetAccountMembers.findMany({
    where: eq(budgetAccountMembers.userId, sessionResult.user.id),
    with: {
      budgetAccount: {
        with: {
          members: {
            with: {
              user: true,
            },
          },
          invitations: true,
        },
      },
    },
  });

  // Map to the structure expected by the UI
  return accountMemberships.map((membership) => {
    const acc = membership.budgetAccount;
    return {
      id: acc.id,
      name: acc.name,
      description: acc.description,
      accountNumber: acc.accountNumber,
      members: acc.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        user: {
          name: m.user?.name ?? "",
          email: m.user?.email ?? "",
          image: m.user?.image ?? null,
        },
      })),
      invitations: acc.invitations.map((inv) => ({
        id: inv.id,
        inviteeEmail: inv.inviteeEmail,
        role: inv.role,
        status: inv.status,
        createdAt: inv.createdAt,
      })),
    };
  });
}

/**
 * Retrieves a specific account by ID
 * @param id - The account ID to retrieve
 * @returns Promise resolving to the account or null if not found
 * @throws {Error} If user is not authenticated
 */
export async function getAccount(
  id: string,
): Promise<AccountWithMembers | null> {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const account = await db.query.budgetAccounts.findFirst({
    where: and(
      eq(budgetAccounts.id, id),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
    with: {
      members: {
        with: {
          user: {
            columns: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      invitations: true,
    },
  });

  return account ? mapAccountToType(account) : null;
}

/**
 * Updates the name of an account
 * @param id - The account ID to update
 * @param name - The new name for the account
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function updateAccountName(id: string, name: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Verify user has permission
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, id),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
      eq(budgetAccountMembers.role, "owner"),
    ),
  });

  if (!member) throw new Error("Not authorized");

  await db
    .update(budgetAccounts)
    .set({ name, updatedAt: new Date() })
    .where(eq(budgetAccounts.id, id));
}

/**
 * Invites a user to join an account
 * @param accountId - The account ID to invite the user to
 * @param email - The email address of the user to invite
 * @param role - The role to assign to the user (defaults to "member")
 * @throws {Error} If user is not authenticated, not authorized, or if invitation already exists
 */
export async function inviteUser(
  accountId: string,
  email: string,
  role: string = "member",
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Verify user has permission
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, accountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
      eq(budgetAccountMembers.role, "owner"),
    ),
  });

  if (!member) throw new Error("Not authorized");

  // Get account details
  const account = await db.query.budgetAccounts.findFirst({
    where: eq(budgetAccounts.id, accountId),
  });

  if (!account) throw new Error("Account not found");

  // Check if invitee is already a member by looking up their user ID
  const inviteeUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (inviteeUser) {
    const existingMember = await db.query.budgetAccountMembers.findFirst({
      where: and(
        eq(budgetAccountMembers.budgetAccountId, accountId),
        eq(budgetAccountMembers.userId, inviteeUser.id),
      ),
    });

    if (existingMember)
      throw new Error("This user is already a member of this account");
  }

  // Check if there's already a pending invitation
  const existingInvite = await db.query.budgetAccountInvitations.findFirst({
    where: and(
      eq(budgetAccountInvitations.budgetAccountId, accountId),
      eq(budgetAccountInvitations.inviteeEmail, email),
      eq(budgetAccountInvitations.status, "pending"),
    ),
  });

  if (existingInvite)
    throw new Error("An invitation is already pending for this email");

  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  // Create the invitation
  await db.insert(budgetAccountInvitations).values({
    id: randomUUID(),
    budgetAccountId: accountId,
    inviterId: sessionResult.user.id,
    inviteeEmail: email,
    role,
    status: "pending",
    token,
    expiresAt,
  });

  // Get inviter's name
  const inviter = await db.query.user.findFirst({
    where: eq(user.id, sessionResult.user.id),
  });

  if (!inviter) throw new Error("Inviter not found");

  // Send invitation email
  await sendAccountInvite({
    to: email,
    inviterName: inviter.name || "A user",
    accountName: account.name,
    token,
  });
}

/**
 * Removes a user from an account
 * @param accountId - The account ID to remove the user from
 * @param userId - The ID of the user to remove
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function removeUser(accountId: string, userId: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Verify user has permission
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, accountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
      eq(budgetAccountMembers.role, "owner"),
    ),
  });

  if (!member) throw new Error("Not authorized");

  await db
    .delete(budgetAccountMembers)
    .where(
      and(
        eq(budgetAccountMembers.budgetAccountId, accountId),
        eq(budgetAccountMembers.userId, userId),
      ),
    );
}

/**
 * Updates a user's role in an account
 * @param accountId - The account ID where the user's role will be updated
 * @param userId - The ID of the user whose role will be updated
 * @param role - The new role to assign
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function updateUserRole(
  accountId: string,
  userId: string,
  role: string,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Verify user has permission
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, accountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
      eq(budgetAccountMembers.role, "owner"),
    ),
  });

  if (!member) throw new Error("Not authorized");

  await db
    .update(budgetAccountMembers)
    .set({ role, updatedAt: new Date() })
    .where(
      and(
        eq(budgetAccountMembers.budgetAccountId, accountId),
        eq(budgetAccountMembers.userId, userId),
      ),
    );
}

/**
 * Resends an invitation to a user
 * @param invitationId - The ID of the invitation to resend
 * @throws {Error} If user is not authenticated, not authorized, or if invitation not found
 */
export async function resendInvite(invitationId: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const invitation = await db.query.budgetAccountInvitations.findFirst({
    where: eq(budgetAccountInvitations.id, invitationId),
    with: {
      budgetAccount: {
        with: {
          members: true,
        },
      },
    },
  });

  if (!invitation) throw new Error("Invitation not found");

  // Verify user has permission
  const member = invitation.budgetAccount.members.find(
    (m) => m.userId === sessionResult.user.id && m.role === "owner",
  );
  if (!member) throw new Error("Not authorized");

  // Generate new token and expiration
  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db
    .update(budgetAccountInvitations)
    .set({
      token,
      expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(budgetAccountInvitations.id, invitationId));

  // Get inviter's name
  const inviter = await db.query.user.findFirst({
    where: eq(user.id, sessionResult.user.id),
  });
  if (!inviter) throw new Error("Inviter not found");

  // Send invitation email
  await sendAccountInvite({
    to: invitation.inviteeEmail,
    inviterName: inviter.name || "A user",
    accountName: invitation.budgetAccount.name,
    token,
  });
}

/**
 * Creates a new budget account
 * @param name - The name of the account
 * @param description - Optional description of the account
 * @returns Promise resolving to the ID of the created account
 * @throws {Error} If user is not authenticated
 */
export async function createAccount(
  name: string,
  description: string | null = null,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Generate a random account number in XXXX-XXXX format
  const generateAccountNumber = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const generatePart = () => {
      return Array.from({ length: 4 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join("");
    };
    return `${generatePart()}-${generatePart()}`;
  };

  const accountId = randomUUID();
  const accountNumber = generateAccountNumber();

  await db.insert(budgetAccounts).values({
    id: accountId,
    name,
    description,
    accountNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(budgetAccountMembers).values({
    id: randomUUID(),
    budgetAccountId: accountId,
    userId: sessionResult.user.id,
    role: "owner",
    joinedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return accountId;
}

/**
 * Deletes an invitation
 * @param invitationId - The ID of the invitation to delete
 * @throws {Error} If user is not authenticated, not authorized, or if invitation not found
 */
export async function deleteInvitation(invitationId: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Find the invitation and its account
  const invitation = await db.query.budgetAccountInvitations.findFirst({
    where: eq(budgetAccountInvitations.id, invitationId),
    with: {
      budgetAccount: {
        with: {
          members: true,
        },
      },
    },
  });
  if (!invitation) throw new Error("Invitation not found");

  // Verify user has permission (must be owner)
  const member = invitation.budgetAccount.members.find(
    (m) => m.userId === sessionResult.user.id && m.role === "owner",
  );
  if (!member) throw new Error("Not authorized");

  // Delete the invitation
  await db
    .delete(budgetAccountInvitations)
    .where(eq(budgetAccountInvitations.id, invitationId));
}
