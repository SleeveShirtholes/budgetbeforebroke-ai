"use server";

import { account, passkey, session, user } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/config";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getPasskeyStatus(userId: string) {
  try {
    const userPasskeys = await db
      .select()
      .from(passkey)
      .where(eq(passkey.userId, userId));
    return {
      hasPasskey: userPasskeys.length > 0,
      passkeys: userPasskeys.map((p) => ({
        id: p.id,
        name: p.name || "Unnamed Passkey",
        deviceType: p.deviceType,
        createdAt: p.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error checking passkey status:", error);
    return { hasPasskey: false, passkeys: [] };
  }
}

// Define a local type for the expected session result structure
interface SessionWithUser {
  user: {
    id: string;
    name?: string;
    email?: string;
    emailVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    image?: string | null;
  };
  session?: unknown;
}

export async function addPasskey(name?: string) {
  try {
    // Get the session, which is likely { user, session } or an error object
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });

    // Type guard for error
    if (!sessionResult || "error" in sessionResult) {
      console.error("Session error:", sessionResult);
      return {
        success: false,
        error: { message: "No active session found" },
      };
    }
    // Type guard for expected session structure
    const user = (sessionResult as SessionWithUser).user;
    if (!user || !user.id) {
      console.error("Invalid user data:", user);
      return {
        success: false,
        error: { message: "Session does not contain user information" },
      };
    }
    const userId = user.id;

    // Try to add the passkey
    const result = await authClient.passkey.addPasskey();

    if (result?.error) {
      console.error("Passkey addition error details:", {
        error: result.error,
        status: result.error.status,
        statusText: result.error.statusText,
        message: result.error.message,
      });
      return {
        success: false,
        error: {
          message: result.error.message || "Failed to add passkey",
        },
      };
    }

    // Update the passkey name if provided
    if (name) {
      const latestPasskey = await db
        .select()
        .from(passkey)
        .where(eq(passkey.userId, userId))
        .orderBy(passkey.createdAt)
        .limit(1);
      if (latestPasskey.length > 0) {
        await db
          .update(passkey)
          .set({ name })
          .where(eq(passkey.id, latestPasskey[0].id));
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding passkey:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while adding passkey",
      },
    };
  }
}

/**
 * Deletes a passkey for the given passkeyId.
 *
 * @param passkeyId - The ID of the passkey to delete.
 * @returns An object indicating success or error.
 */
export async function deletePasskey(passkeyId: string) {
  try {
    // Attempt to delete the passkey using the auth client
    const result = await authClient.passkey.deletePasskey({ id: passkeyId });
    if (!result?.error) {
      // If successful, remove the passkey from the database
      await db.delete(passkey).where(eq(passkey.id, passkeyId));
    }
    return { success: !result?.error, error: result?.error };
  } catch (error) {
    console.error("Error deleting passkey:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while deleting passkey",
      },
    };
  }
}

/**
 * Retrieves account information for the current user, specifically password status and last changed date.
 *
 * @returns An object with hasPassword and passwordLastChanged fields, or an error.
 */
export async function getAccountInfo() {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult) {
      return { error: "Unauthorized" };
    }
    const user = sessionResult.user;
    if (!user || !user.id) {
      return { error: "Unauthorized" };
    }
    // Get the user's credential account
    const userAccount = await db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, user.id), eq(account.providerId, "credential")),
      )
      .limit(1);
    if (!userAccount.length) {
      return { hasPassword: false, passwordLastChanged: null };
    }
    return {
      hasPassword: !!userAccount[0].password,
      passwordLastChanged: userAccount[0].passwordChangedAt,
    };
  } catch (error) {
    console.error("Error fetching account data:", error);
    return { error: "Internal Server Error" };
  }
}

/**
 * Server action to change the user's password
 */
export async function changePasswordAction(currentPassword: string | null) {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult) {
      return { error: "Unauthorized" };
    }
    const user = sessionResult.user;
    if (!user || !user.id) {
      return { error: "Unauthorized" };
    }

    // Get the user's account to check if they have a password
    const userAccount = await db
      .select()
      .from(account)
      .where(eq(account.userId, user.id))
      .limit(1);
    if (!userAccount.length) {
      return { error: "Account not found" };
    }

    const hasExistingPassword = !!userAccount[0].password;

    // If there's an existing password, we need the current password
    if (hasExistingPassword && !currentPassword) {
      return { error: "Current password is required" };
    }

    // If no password exists, we need to create a credential account
    if (!hasExistingPassword) {
      // Check if there's already a credential account
      const credentialAccount = await db
        .select()
        .from(account)
        .where(
          and(
            eq(account.userId, user.id),
            eq(account.providerId, "credentials"),
          ),
        )
        .limit(1);

      if (!credentialAccount.length) {
        // Create a new credential account
        await db.insert(account).values({
          id: crypto.randomUUID(),
          userId: user.id,
          providerId: "credentials",
          accountId: user.id, // For credential accounts, accountId is the same as userId
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return {
      hasExistingPassword,
      message: hasExistingPassword
        ? "Password can be updated"
        : "Password can be created",
    };
  } catch (error) {
    console.error("Error validating password change:", error);
    return { error: "Internal Server Error" };
  }
}

/**
 * Server action to update the name of the most recently added passkey for the current user
 */
export async function updateLatestPasskeyName(name: string) {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult) {
      return { error: "Unauthorized" };
    }
    const user = sessionResult.user;
    if (!user || !user.id) {
      return { error: "Unauthorized" };
    }
    // Get the latest passkey for the user
    const latestPasskey = await db
      .select()
      .from(passkey)
      .where(eq(passkey.userId, user.id))
      .orderBy(passkey.createdAt)
      .limit(1);
    if (latestPasskey.length > 0) {
      await db
        .update(passkey)
        .set({ name })
        .where(eq(passkey.id, latestPasskey[0].id));
      return { message: "Passkey name updated" };
    }
    return { error: "No passkey found to update" };
  } catch (error) {
    console.error("Error updating passkey name:", error);
    return { error: "Internal Server Error" };
  }
}

/**
 * Sets a new password for the current user using the auth API.
 * Also updates the passwordChangedAt timestamp in the database.
 *
 * @param newPassword - The new password to set for the user.
 * @returns An object with a success message or error.
 */
export async function setPasswordAction(newPassword: string) {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult) {
      return { error: "Unauthorized" };
    }
    const user = sessionResult.user;
    if (!user || !user.id) {
      return { error: "Unauthorized" };
    }

    // Set the password using the auth API
    const result = await auth.api.setPassword({
      headers: await headers(),
      body: { newPassword },
    });

    if (!result.status) {
      return { error: "Failed to set password" };
    }

    // Update the passwordChangedAt timestamp
    await db
      .update(account)
      .set({
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(account.userId, user.id), eq(account.providerId, "credential")),
      );

    return { message: "Password set successfully" };
  } catch (error) {
    console.error("Error setting password:", error);
    return { error: "Internal Server Error" };
  }
}

/**
 * Validates whether the user can change their password and whether they have an existing password.
 *
 * @returns An object indicating if the user has an existing password and if the validation was successful.
 */
export async function validatePasswordChange() {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult) {
      return { success: false, error: "Unauthorized" };
    }
    const user = sessionResult.user;
    if (!user || !user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user has an existing password
    const existingAccount = await db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, user.id), eq(account.providerId, "credential")),
      )
      .limit(1);

    const hasExistingPassword = existingAccount.length > 0;

    // No need to validate the password here, just return the status
    return { success: true, hasExistingPassword };
  } catch (error) {
    console.error("Error validating password change:", error);
    return { success: false, error: "Failed to validate password change" };
  }
}

/**
 * Returns the current user's passkeys (for use in client components).
 *
 * @returns An array of passkeys for the current user.
 */
export async function getCurrentUserPasskeys() {
  const sessionResult = await auth.api.getSession({ headers: await headers() });
  if (!sessionResult || "error" in sessionResult) return [];
  const user = sessionResult.user;
  if (!user || !user.id) return [];
  const { passkeys } = await getPasskeyStatus(user.id);
  return passkeys;
}

/**
 * Updates the passwordChangedAt timestamp for the current user's credential account.
 *
 * @returns An object with a success message or error.
 */
export async function updatePasswordTimestamp() {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult) {
      return { error: "Unauthorized" };
    }
    const user = sessionResult.user;
    if (!user || !user.id) {
      return { error: "Unauthorized" };
    }
    await db
      .update(account)
      .set({
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(account.userId, user.id), eq(account.providerId, "credential")),
      );
    return { message: "Password timestamp updated" };
  } catch (error) {
    console.error("Error updating password timestamp:", error);
    return { error: "Internal Server Error" };
  }
}

export async function getProfile() {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
      throw new Error("Unauthorized");
    }
    const userId = sessionResult.user.id;
    // Get user profile
    const [userProfile] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));
    if (!userProfile) {
      throw new Error("User not found");
    }
    return {
      name: userProfile.name,
      email: userProfile.email,
      phoneNumber: userProfile.phoneNumber,
      image: userProfile.image,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

export async function updateProfile(formData: {
  name?: string;
  phoneNumber?: string;
}) {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
      throw new Error("Unauthorized");
    }
    const userId = sessionResult.user.id;
    const { name, phoneNumber } = formData;
    // Update user profile
    await db
      .update(user)
      .set({
        name: name || undefined,
        phoneNumber: phoneNumber || undefined,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

/**
 * Retrieves all sign-in methods for the current user (excluding passkeys)
 * @returns Array of sign-in methods with their details
 */
export async function getSignInMethods() {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult) {
      throw new Error("Unauthorized");
    }
    const user = sessionResult.user;
    if (!user || !user.id) {
      throw new Error("Unauthorized");
    }

    // Get all accounts for the user
    const userAccounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, user.id));

    // Get the most recent session for each provider
    const methods = await Promise.all(
      userAccounts.map(async (acc) => {
        // Get the most recent session for this account
        const [latestSession] = await db
          .select()
          .from(session)
          .where(eq(session.userId, user.id))
          .orderBy(desc(session.createdAt))
          .limit(1);

        return {
          id: acc.id,
          type: acc.providerId === "credentials" ? "password" : "oauth",
          provider:
            acc.providerId.charAt(0).toUpperCase() + acc.providerId.slice(1),
          lastUsed: latestSession?.createdAt.toISOString() || "Never",
        };
      }),
    );

    return methods;
  } catch (error) {
    console.error("Error fetching sign-in methods:", error);
    throw error;
  }
}

/**
 * Deletes a sign-in method for the current user
 * @param methodId - The ID of the sign-in method to delete
 */
export async function deleteSignInMethod(methodId: string) {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult) {
      throw new Error("Unauthorized");
    }
    const user = sessionResult.user;
    if (!user || !user.id) {
      throw new Error("Unauthorized");
    }

    // Delete the account
    await db
      .delete(account)
      .where(and(eq(account.id, methodId), eq(account.userId, user.id)));
  } catch (error) {
    console.error("Error deleting sign-in method:", error);
    throw error;
  }
}

/**
 * Adds a Google account as a sign-in method for the current user
 * @returns The result of the Google sign-in attempt
 */
export async function addGoogleAccount() {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult) {
      throw new Error("Unauthorized");
    }
    const user = sessionResult.user;
    if (!user || !user.id) {
      throw new Error("Unauthorized");
    }

    // Check if user already has a Google account
    const existingGoogleAccount = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, user.id), eq(account.providerId, "google")))
      .limit(1);

    if (existingGoogleAccount.length > 0) {
      throw new Error("Google account already linked");
    }

    // Return the Google sign-in URL
    return { success: true };
  } catch (error) {
    console.error("Error adding Google account:", error);
    throw error;
  }
}

/**
 * Fetches account information including creation date and last login
 * @returns An object containing accountCreated and lastLogin dates
 */
export async function getAccountInformation() {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });
    if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
      throw new Error("Unauthorized");
    }
    const userId = sessionResult.user.id;

    // Get user's creation date
    const [userProfile] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));
    if (!userProfile) {
      throw new Error("User not found");
    }

    // Get user's last login from the most recent session
    const [lastSession] = await db
      .select()
      .from(session)
      .where(eq(session.userId, userId))
      .orderBy(desc(session.createdAt))
      .limit(1);

    return {
      accountCreated: userProfile.createdAt.toISOString(),
      lastLogin:
        lastSession?.createdAt.toISOString() ||
        userProfile.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching account information:", error);
    throw error;
  }
}
