"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema";
import { createAccount } from "./account";
import { createIncomeSource } from "./income";

/**
 * Update user's default budget account after onboarding account creation
 */
export async function updateUserDefaultAccount(budgetAccountId: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.session || !sessionResult?.user) {
    throw new Error("Not authenticated");
  }

  await db
    .update(user)
    .set({ 
      defaultBudgetAccountId: budgetAccountId,
      updatedAt: new Date(),
    })
    .where(eq(user.id, sessionResult.user.id));

  return { success: true };
}

/**
 * Complete onboarding flow setup
 */
export async function completeOnboarding() {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.session || !sessionResult?.user) {
    throw new Error("Not authenticated");
  }

  // Mark user as having completed onboarding
  await db
    .update(user)
    .set({ 
      updatedAt: new Date(),
    })
    .where(eq(user.id, sessionResult.user.id));

  return { success: true };
}

export type OnboardingData = {
  accountName: string;
  accountDescription?: string;
  inviteEmails?: string[];
  incomeSource?: {
    name: string;
    amount: number;
    frequency: "weekly" | "bi-weekly" | "monthly";
    startDate: Date;
  };
};

/**
 * Complete the entire onboarding flow in one action (for skip functionality)
 */
export async function quickCompleteOnboarding(data: Partial<OnboardingData>) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.session || !sessionResult?.user) {
    throw new Error("Not authenticated");
  }

  // Create budget account if provided
  let budgetAccountId: string | null = null;
  if (data.accountName) {
    const accountResult = await createAccount(
      data.accountName,
      data.accountDescription || ""
    );
    budgetAccountId = accountResult;
  }

  // Update user's default account
  if (budgetAccountId) {
    await updateUserDefaultAccount(budgetAccountId);
  }

  // Create income source if provided
  if (data.incomeSource) {
    await createIncomeSource(
      data.incomeSource.name,
      data.incomeSource.amount,
      data.incomeSource.frequency,
      data.incomeSource.startDate
    );
  }

  await completeOnboarding();

  return { 
    success: true,
    budgetAccountId,
  };
}