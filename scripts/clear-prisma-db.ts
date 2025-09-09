/**
 * Script to clear all data from the Prisma database
 * This will delete all data but keep the schema structure intact
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // This should be your Prisma database URL
    },
  },
});

async function clearDatabase() {
  try {
    console.log("🔍 Connecting to Prisma database...");
    await db.$connect();
    console.log("✅ Connected to Prisma database\n");

    console.log(
      "⚠️  WARNING: This will delete ALL data from your Prisma database!",
    );
    console.log("⚠️  Make sure DATABASE_URL points to the correct database.\n");

    // Get all table names from the database
    const tables = await db.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename != '_prisma_migrations'
      ORDER BY tablename;
    `;

    console.log(`📊 Found ${tables.length} tables to clear:`);
    tables.forEach((table) => console.log(`  - ${table.tablename}`));
    console.log("");

    // Disable foreign key checks temporarily
    console.log("🔧 Disabling foreign key constraints...");
    await db.$executeRaw`SET session_replication_role = replica;`;

    // Clear all tables
    let totalCleared = 0;
    for (const table of tables) {
      const tableName = table.tablename;
      console.log(`🗑️  Clearing table: ${tableName}`);

      const result = await db.$executeRaw`DELETE FROM ${tableName}`;
      console.log(`   ✅ Cleared ${result} records from ${tableName}`);
      totalCleared += Number(result);
    }

    // Re-enable foreign key checks
    console.log("\n🔧 Re-enabling foreign key constraints...");
    await db.$executeRaw`SET session_replication_role = DEFAULT;`;

    console.log(
      `\n✅ Successfully cleared ${totalCleared} total records from ${tables.length} tables`,
    );
    console.log("🎉 Prisma database is now empty and ready for migration!");
  } catch (error) {
    console.error("💥 Error clearing database:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the script
clearDatabase()
  .then(() => {
    console.log("\n🏁 Database clearing completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Database clearing failed:", error);
    process.exit(1);
  });
