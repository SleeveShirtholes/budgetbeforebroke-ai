#!/usr/bin/env tsx
/**
 * Database Backup Script - Node.js/Prisma Based
 *
 * This script creates a comprehensive backup of your database using Prisma
 * without requiring pg_dump or external PostgreSQL tools.
 */

import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { config } from "dotenv";

// Load environment variables
config();

if (!process.env.DATABASE_URL_OLD && !process.env.DATABASE_URL) {
  console.error(
    "❌ Missing DATABASE_URL_OLD or DATABASE_URL environment variable",
  );
  process.exit(1);
}

const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_OLD || process.env.DATABASE_URL,
    },
  },
});

async function createBackup() {
  const timestamp =
    new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] +
    "_" +
    new Date().toTimeString().split(" ")[0].replace(/:/g, "");
  const backupFile = `backup_${timestamp}.json`;

  console.log("🔄 Starting database backup...");
  console.log(`📁 Backup file: ${backupFile}\n`);

  try {
    await db.$connect();

    const backup: any = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        source: "prisma-backup-script",
      },
      data: {},
    };

    // Backup all tables in dependency order
    const tables = [
      "users",
      "budgetAccounts",
      "budgetAccountMembers",
      "budgetAccountInvitations",
      "incomeSources",
      "debts",
      "monthlyDebtPlanning",
      "debtAllocations",
      "transactions",
      "goals",
      "plaidItems",
      "supportRequests",
      "supportComments",
      "dismissedWarnings",
      "contactSubmissions",
      "sessions",
      "accounts",
      "passkeys",
    ];

    for (const table of tables) {
      try {
        console.log(`📊 Backing up ${table}...`);

        let data: any[] = [];

        switch (table) {
          case "users":
            data = await db.user.findMany();
            break;
          case "budgetAccounts":
            data = await db.budgetAccount.findMany();
            break;
          case "budgetAccountMembers":
            data = await db.budgetAccountMember.findMany();
            break;
          case "budgetAccountInvitations":
            data = await db.budgetAccountInvitation.findMany();
            break;
          case "incomeSources":
            data = await db.incomeSource.findMany();
            break;
          case "debts":
            data = await db.debt.findMany();
            break;
          case "monthlyDebtPlanning":
            data = await db.monthlyDebtPlanning.findMany();
            break;
          case "debtAllocations":
            data = await db.debtAllocation.findMany();
            break;
          case "transactions":
            data = await db.transaction.findMany();
            break;
          case "goals":
            data = await db.goal.findMany();
            break;
          case "plaidItems":
            data = await db.plaidItem.findMany();
            break;
          case "supportRequests":
            data = await db.supportRequest.findMany();
            break;
          case "supportComments":
            data = await db.supportComment.findMany();
            break;
          case "dismissedWarnings":
            data = await db.dismissedWarning.findMany();
            break;
          case "contactSubmissions":
            data = await db.contactSubmission.findMany();
            break;
          case "sessions":
            data = await db.session.findMany();
            break;
          case "accounts":
            data = await db.account.findMany();
            break;
          case "passkeys":
            data = await db.passkey.findMany();
            break;
          default:
            console.log(`⚠️  Unknown table: ${table}, skipping...`);
            continue;
        }

        // Convert Decimal and Date objects to strings for JSON serialization
        const serializedData = data.map((record) => {
          const serialized: any = {};
          for (const [key, value] of Object.entries(record)) {
            if (value instanceof Date) {
              serialized[key] = value.toISOString();
            } else if (
              typeof value === "object" &&
              value !== null &&
              "toString" in value
            ) {
              // Handle Prisma Decimal type
              serialized[key] = value.toString();
            } else {
              serialized[key] = value;
            }
          }
          return serialized;
        });

        backup.data[table] = serializedData;
        console.log(`✅ ${table}: ${data.length} records backed up`);
      } catch (error) {
        console.log(`⚠️  Error backing up ${table}:`, error);
        backup.data[table] = [];
      }
    }

    // Write backup to file
    const backupJson = JSON.stringify(backup, null, 2);
    writeFileSync(backupFile, backupJson);

    // Calculate file size
    const stats = require("fs").statSync(backupFile);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    console.log("\n🎉 Backup completed successfully!");
    console.log(`📁 File: ${backupFile}`);
    console.log(`📊 Size: ${fileSizeInMB.toFixed(2)} MB`);
    console.log(
      `📈 Total records: ${Object.values(backup.data).reduce((sum: number, table: any) => sum + table.length, 0)}`,
    );

    // Show summary
    console.log("\n📋 Backup Summary:");
    Object.entries(backup.data).forEach(([table, records]: [string, any]) => {
      if (records.length > 0) {
        console.log(`   ${table}: ${records.length} records`);
      }
    });
  } catch (error) {
    console.error("❌ Backup failed:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run backup
if (require.main === module) {
  createBackup()
    .then(() => {
      console.log("\n✨ Backup process completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Backup failed:", error);
      process.exit(1);
    });
}
