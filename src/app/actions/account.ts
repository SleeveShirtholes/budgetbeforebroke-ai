/**
 * Server-side actions for managing budget accounts and their members.
 * @module account
 */

"use server";

import {
  BudgetAccount,
  BudgetAccountMember,
  BudgetAccountInvitation,
  db,
} from "@/db/schema";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { sendAccountInvite } from "@/lib/email";

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
type MemberWithMaybeUser = BudgetAccountMember & {
  user?: {
    name?: string;
    email?: string;
    image?: string | null;
  };
};

/**
 * Represents an account with its related members and invitations
 */
type AccountWithRelations = BudgetAccount & {
  members: MemberWithMaybeUser[];
  invitations: BudgetAccountInvitation[];
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
  const accountMemberships = await db.budgetAccountMember.findMany({
    where: {
      userId: sessionResult.user.id,
    },
    include: {
      budgetAccount: {
        include: {
          members: {
            include: {
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

  // First check if user is a member of this account
  const membership = await db.budgetAccountMember.findFirst({
    where: {
      budgetAccountId: id,
      userId: sessionResult.user.id,
    },
  });

  if (!membership) {
    return null;
  }

  const account = await db.budgetAccount.findFirst({
    where: {
      id: id,
    },
    include: {
      members: {
        include: {
          user: {
            select: {
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
  const member = await db.budgetAccountMember.findFirst({
    where: {
      budgetAccountId: id,
      userId: sessionResult.user.id,
      role: "owner",
    },
  });

  if (!member) throw new Error("Not authorized");

  await db.budgetAccount.update({
    where: { id },
    data: {
      name,
      updatedAt: new Date(),
    },
  });
}

/**
 * Invites a user to join the current user's default budget account
 * @param email - The email address of the user to invite
 * @param role - The role to assign to the invited user
 * @returns Promise<{ success: boolean }>
 */
export async function inviteToAccount(email: string, role: string = "member") {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.session || !sessionResult?.user) {
    throw new Error("Not authenticated");
  }

  // Get user's default account
  const currentUser = await db.user.findFirst({
    where: { id: sessionResult.user.id },
  });

  if (!currentUser?.defaultBudgetAccountId) {
    throw new Error("No default budget account found");
  }

  return await inviteUser(currentUser.defaultBudgetAccountId, email, role);
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
  const member = await db.budgetAccountMember.findFirst({
    where: {
      budgetAccountId: accountId,
      userId: sessionResult.user.id,
      role: "owner",
    },
  });

  if (!member) throw new Error("Not authorized");

  // Get account details
  const account = await db.budgetAccount.findFirst({
    where: { id: accountId },
  });

  if (!account) throw new Error("Account not found");

  // Check if invitee is already a member by looking up their user ID
  const inviteeUser = await db.user.findFirst({
    where: { email: email },
  });

  if (inviteeUser) {
    const existingMember = await db.budgetAccountMember.findFirst({
      where: {
        budgetAccountId: accountId,
        userId: inviteeUser.id,
      },
    });

    if (existingMember)
      throw new Error("This user is already a member of this account");
  }

  // Check if there's already a pending invitation
  const existingInvite = await db.budgetAccountInvitation.findFirst({
    where: {
      budgetAccountId: accountId,
      inviteeEmail: email,
      status: "pending",
    },
  });

  if (existingInvite)
    throw new Error("An invitation is already pending for this email");

  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  // Create the invitation
  await db.budgetAccountInvitation.create({
    data: {
      id: randomUUID(),
      budgetAccountId: accountId,
      inviterId: sessionResult.user.id,
      inviteeEmail: email,
      role,
      status: "pending",
      token,
      expiresAt,
    },
  });

  // Get inviter's name
  const inviter = await db.user.findFirst({
    where: { id: sessionResult.user.id },
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
  const member = await db.budgetAccountMember.findFirst({
    where: {
      budgetAccountId: accountId,
      userId: sessionResult.user.id,
      role: "owner",
    },
  });

  if (!member) throw new Error("Not authorized");

  await db.budgetAccountMember.deleteMany({
    where: {
      budgetAccountId: accountId,
      userId: userId,
    },
  });
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
  const member = await db.budgetAccountMember.findFirst({
    where: {
      budgetAccountId: accountId,
      userId: sessionResult.user.id,
      role: "owner",
    },
  });

  if (!member) throw new Error("Not authorized");

  await db.budgetAccountMember.updateMany({
    where: {
      budgetAccountId: accountId,
      userId: userId,
    },
    data: {
      role,
      updatedAt: new Date(),
    },
  });
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

  const invitation = await db.budgetAccountInvitation.findFirst({
    where: { id: invitationId },
    include: {
      budgetAccount: {
        include: {
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

  await db.budgetAccountInvitation.update({
    where: { id: invitationId },
    data: {
      token,
      expiresAt,
      updatedAt: new Date(),
    },
  });

  // Get inviter's name
  const inviter = await db.user.findFirst({
    where: { id: sessionResult.user.id },
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

  await db.budgetAccount.create({
    data: {
      id: accountId,
      name,
      description,
      accountNumber,
    },
  });

  await db.budgetAccountMember.create({
    data: {
      id: randomUUID(),
      budgetAccountId: accountId,
      userId: sessionResult.user.id,
      role: "owner",
    },
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
  const invitation = await db.budgetAccountInvitation.findFirst({
    where: { id: invitationId },
    include: {
      budgetAccount: {
        include: {
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
  await db.budgetAccountInvitation.delete({
    where: { id: invitationId },
  });
}

/**
 * Gets the user's default budget account
 * @returns The default account ID or null if not set
 * @throws {Error} If user is not authenticated
 */
export async function getDefaultAccount() {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const userResult = await db.user.findFirst({
    where: { id: sessionResult.user.id },
    select: {
      defaultBudgetAccountId: true,
    },
  });

  return userResult?.defaultBudgetAccountId || null;
}

/**
 * Updates the user's default budget account
 * @param accountId - The ID of the account to set as default
 * @throws {Error} If user is not authenticated
 */
export async function updateDefaultAccount(accountId: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  await db.user.update({
    where: { id: sessionResult.user.id },
    data: { defaultBudgetAccountId: accountId },
  });
}
