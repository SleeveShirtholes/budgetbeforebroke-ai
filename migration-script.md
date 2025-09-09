# Database Migration Script

## Step 4: Initialize New Database Schema

```bash
# Push your current schema to the new Prisma database
yarn db:push

# Or if you want to create migrations
yarn db:migrate
```

## Step 5: Data Migration Script

Create a data migration script to transfer data:

```typescript
// scripts/migrate-data.ts
import { PrismaClient } from "@prisma/client";

const oldDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_OLD!,
    },
  },
});

const newDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});

async function migrateData() {
  try {
    console.log("Starting data migration...");

    // Migrate users first (no foreign key dependencies)
    const users = await oldDb.user.findMany();
    console.log(`Migrating ${users.length} users...`);

    for (const user of users) {
      await newDb.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }

    // Migrate budget accounts
    const budgetAccounts = await oldDb.budgetAccount.findMany();
    console.log(`Migrating ${budgetAccounts.length} budget accounts...`);

    for (const account of budgetAccounts) {
      await newDb.budgetAccount.upsert({
        where: { id: account.id },
        update: account,
        create: account,
      });
    }

    // Continue with other tables in dependency order...
    // Add more migration logic for your specific tables

    console.log("Data migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  }
}

// Run migration
migrateData().catch(console.error);
```

## Step 6: Validation Script

```typescript
// scripts/validate-migration.ts
async function validateMigration() {
  // Compare record counts between old and new databases
  const oldUserCount = await oldDb.user.count();
  const newUserCount = await newDb.user.count();

  console.log(`Old DB Users: ${oldUserCount}, New DB Users: ${newUserCount}`);

  // Add more validation checks for critical data
}
```
