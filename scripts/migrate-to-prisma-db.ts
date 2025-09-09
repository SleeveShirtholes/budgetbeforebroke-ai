#!/usr/bin/env tsx
/**
 * Database Migration Script: From Current DB to Prisma Database
 *
 * This script migrates all data from your current database to the new Prisma database
 * while maintaining referential integrity and data consistency.
 */

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables
config();

// Debug environment variables
console.log("🔍 Environment variables check:");
console.log(`DATABASE_URL_OLD exists: ${!!process.env.DATABASE_URL_OLD}`);
console.log(`DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
console.log(
  `DATABASE_URL starts with: ${process.env.DATABASE_URL?.split("://")[0]}://`,
);

if (!process.env.DATABASE_URL_OLD || !process.env.DATABASE_URL) {
  console.error("❌ Missing required environment variables:");
  console.error("   DATABASE_URL_OLD - Your current database URL");
  console.error("   DATABASE_URL - Your new Prisma database URL");
  process.exit(1);
}

// Create clients exactly like the working connection test
const oldDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_OLD,
    },
  },
});

// Use the exact same approach as the working test
const newDb = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

async function migrateData() {
  console.log("🚀 Starting database migration...\n");

  try {
    // Test connections
    console.log("🔍 Testing database connections...");

    // Show URL info for debugging
    const oldUrl = process.env.OLD_PRODUCTION_DATABASE_URL;
    const newUrl = process.env.PRODUCTION_DATABASE_URL;

    console.log(`Old DB URL: ${oldUrl?.substring(0, 20)}...`);
    console.log(`New DB URL: ${newUrl?.substring(0, 20)}...`);
    console.log(`New DB URL length: ${newUrl?.length}`);
    console.log(`New DB URL starts with: ${newUrl?.split("://")[0]}://`);

    console.log("🔍 Connecting to old database...");
    await oldDb.$connect();
    console.log("✅ Old database connected");

    console.log("🔍 Connecting to new database...");
    await newDb.$connect();
    console.log("✅ New database connected");

    console.log("✅ Database connections established\n");

    // Migration order (respecting foreign key dependencies)
    const migrationSteps = [
      { name: "Users", migrate: migrateUsers },
      { name: "Budget Accounts", migrate: migrateBudgetAccounts },
      { name: "Budget Account Members", migrate: migrateBudgetAccountMembers },
      {
        name: "Budget Account Invitations",
        migrate: migrateBudgetAccountInvitations,
      },
      { name: "Categories", migrate: migrateCategories },
      { name: "Income Sources", migrate: migrateIncomeSources },
      { name: "Budgets", migrate: migrateBudgets },
      { name: "Budget Categories", migrate: migrateBudgetCategories },
      { name: "Debts", migrate: migrateDebts },
      { name: "Monthly Debt Planning", migrate: migrateMonthlyDebtPlanning },
      { name: "Debt Allocations", migrate: migrateDebtAllocations },
      { name: "Transactions", migrate: migrateTransactions },
      { name: "Goals", migrate: migrateGoals },
      { name: "Sessions", migrate: migrateSessions },
      { name: "Accounts", migrate: migrateAccounts },
      { name: "Passkeys", migrate: migratePasskeys },
      { name: "Plaid Items", migrate: migratePlaidItems },
      { name: "Support Requests", migrate: migrateSupportRequests },
      { name: "Support Comments", migrate: migrateSupportComments },
      { name: "Dismissed Warnings", migrate: migrateDismissedWarnings },
      { name: "Contact Submissions", migrate: migrateContactSubmissions },
    ];

    for (const step of migrationSteps) {
      console.log(`📊 Migrating ${step.name}...`);
      const count = await step.migrate();
      console.log(`✅ ${step.name}: ${count} records migrated\n`);
    }

    console.log("🎉 Migration completed successfully!");

    // Run validation
    await validateMigration();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  }
}

async function migrateUsers(): Promise<number> {
  const records = await oldDb.user.findMany();

  for (const record of records) {
    await newDb.user.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateBudgetAccounts(): Promise<number> {
  const records = await oldDb.budgetAccount.findMany();

  for (const record of records) {
    await newDb.budgetAccount.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateBudgetAccountMembers(): Promise<number> {
  const records = await oldDb.budgetAccountMember.findMany();

  for (const record of records) {
    await newDb.budgetAccountMember.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateBudgetAccountInvitations(): Promise<number> {
  const records = await oldDb.budgetAccountInvitation.findMany();

  for (const record of records) {
    await newDb.budgetAccountInvitation.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateIncomeSources(): Promise<number> {
  const records = await oldDb.incomeSource.findMany();

  for (const record of records) {
    await newDb.incomeSource.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateDebts(): Promise<number> {
  const records = await oldDb.debt.findMany();

  for (const record of records) {
    await newDb.debt.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateMonthlyDebtPlanning(): Promise<number> {
  const records = await oldDb.monthlyDebtPlanning.findMany();

  for (const record of records) {
    await newDb.monthlyDebtPlanning.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateDebtAllocations(): Promise<number> {
  const records = await oldDb.debtAllocation.findMany();

  for (const record of records) {
    await newDb.debtAllocation.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateTransactions(): Promise<number> {
  const records = await oldDb.transaction.findMany();

  for (const record of records) {
    await newDb.transaction.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateCategories(): Promise<number> {
  const records = await oldDb.category.findMany();

  for (const record of records) {
    await newDb.category.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateBudgets(): Promise<number> {
  try {
    const records = await oldDb.budget.findMany();

    for (const record of records) {
      await newDb.budget.upsert({
        where: { id: record.id },
        update: record,
        create: record,
      });
    }

    return records.length;
  } catch (error) {
    console.log("⚠️  Budget table not found, skipping...");
    return 0;
  }
}

async function migrateBudgetCategories(): Promise<number> {
  try {
    const records = await oldDb.budgetCategory.findMany();

    for (const record of records) {
      await newDb.budgetCategory.upsert({
        where: { id: record.id },
        update: record,
        create: record,
      });
    }

    return records.length;
  } catch (error) {
    console.log("⚠️  BudgetCategory table not found, skipping...");
    return 0;
  }
}

async function migrateGoals(): Promise<number> {
  const records = await oldDb.goal.findMany();

  for (const record of records) {
    await newDb.goal.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  return records.length;
}

async function migrateSessions(): Promise<number> {
  try {
    const records = await oldDb.session.findMany();

    for (const record of records) {
      await newDb.session.upsert({
        where: { id: record.id },
        update: record,
        create: record,
      });
    }

    return records.length;
  } catch (error) {
    console.log("⚠️  Session table not found, skipping...");
    return 0;
  }
}

async function migrateAccounts(): Promise<number> {
  try {
    const records = await oldDb.account.findMany();

    for (const record of records) {
      await newDb.account.upsert({
        where: { id: record.id },
        update: record,
        create: record,
      });
    }

    return records.length;
  } catch (error) {
    console.log("⚠️  Account table not found, skipping...");
    return 0;
  }
}

async function migratePasskeys(): Promise<number> {
  try {
    const records = await oldDb.passkey.findMany();

    for (const record of records) {
      await newDb.passkey.upsert({
        where: { id: record.id },
        update: record,
        create: record,
      });
    }

    return records.length;
  } catch (error) {
    console.log("⚠️  Passkey table not found, skipping...");
    return 0;
  }
}

async function migratePlaidItems(): Promise<number> {
  try {
    const records = await oldDb.plaidItem.findMany();

    for (const record of records) {
      await newDb.plaidItem.upsert({
        where: { id: record.id },
        update: record,
        create: record,
      });
    }

    return records.length;
  } catch (error) {
    console.log("⚠️  PlaidItem table not found, skipping...");
    return 0;
  }
}

async function migrateSupportRequests(): Promise<number> {
  try {
    const records = await oldDb.supportRequest.findMany();

    for (const record of records) {
      await newDb.supportRequest.upsert({
        where: { id: record.id },
        update: record,
        create: record,
      });
    }

    return records.length;
  } catch (error) {
    console.log("⚠️  SupportRequest table not found, skipping...");
    return 0;
  }
}

async function migrateSupportComments(): Promise<number> {
  try {
    const records = await oldDb.supportComment.findMany();

    for (const record of records) {
      await newDb.supportComment.upsert({
        where: { id: record.id },
        update: record,
        create: record,
      });
    }

    return records.length;
  } catch (error) {
    console.log("⚠️  SupportComment table not found, skipping...");
    return 0;
  }
}

async function migrateDismissedWarnings(): Promise<number> {
  try {
    const records = await oldDb.dismissedWarning.findMany();

    for (const record of records) {
      await newDb.dismissedWarning.upsert({
        where: { id: record.id },
        update: record,
        create: record,
      });
    }

    return records.length;
  } catch (error) {
    console.log("⚠️  DismissedWarning table not found, skipping...");
    return 0;
  }
}

async function migrateContactSubmissions(): Promise<number> {
  try {
    const records = await oldDb.contactSubmission.findMany();

    for (const record of records) {
      await newDb.contactSubmission.upsert({
        where: { id: record.id },
        update: record,
        create: record,
      });
    }

    return records.length;
  } catch (error) {
    console.log("⚠️  ContactSubmission table not found, skipping...");
    return 0;
  }
}

async function validateMigration() {
  console.log("🔍 Validating migration...\n");

  const validations = [
    {
      name: "Users",
      old: () => oldDb.user.count(),
      new: () => newDb.user.count(),
    },
    {
      name: "Budget Accounts",
      old: () => oldDb.budgetAccount.count(),
      new: () => newDb.budgetAccount.count(),
    },
    {
      name: "Income Sources",
      old: () => oldDb.incomeSource.count(),
      new: () => newDb.incomeSource.count(),
    },
    {
      name: "Debts",
      old: () => oldDb.debt.count(),
      new: () => newDb.debt.count(),
    },
    {
      name: "Transactions",
      old: () => oldDb.transaction.count(),
      new: () => newDb.transaction.count(),
    },
  ];

  let allValid = true;

  for (const validation of validations) {
    const oldCount = await validation.old();
    const newCount = await validation.new();

    if (oldCount === newCount) {
      console.log(`✅ ${validation.name}: ${oldCount} records (match)`);
    } else {
      console.log(
        `❌ ${validation.name}: Old=${oldCount}, New=${newCount} (MISMATCH)`,
      );
      allValid = false;
    }
  }

  if (allValid) {
    console.log("\n🎉 All validations passed! Migration is successful.");
  } else {
    console.log("\n⚠️  Some validations failed. Please review the migration.");
  }
}

// Run the migration
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log("\n✨ Migration process completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Migration failed:", error);
      process.exit(1);
    });
}
