# Database Migration Guide: Moving to Prisma Database

This guide will help you safely migrate from your current database to Prisma's new database service.

## 🚨 IMPORTANT: Pre-Migration Checklist

- [ ] **Backup your current database** (CRITICAL!)
- [ ] **Test the migration on a staging environment first**
- [ ] **Plan for downtime** (recommended: during low-traffic hours)
- [ ] **Have a rollback plan ready**

## Step 1: Set Up Prisma Database

1. Go to [Prisma Data Platform](https://console.prisma.io/)
2. Create a new database project
3. Copy your new database connection string

## Step 2: Install Dependencies

```bash
yarn add tsx
```

## Step 3: Environment Variables Setup

Update your `.env` file:

```env
# Keep your current database URL as backup
DATABASE_URL_OLD="your_current_database_url"

# Add your new Prisma database URL - MUST use prisma:// protocol!
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=your_api_key"
```

⚠️ **Critical**: Your `DATABASE_URL` for Prisma's database service MUST start with `prisma://` or `prisma+postgres://`, not `postgresql://`.

**How to get your Prisma Database URL:**

1. Go to [Prisma Data Platform Console](https://console.prisma.io/)
2. Navigate to your project/database
3. Copy the connection string (it will start with `prisma://`)
4. Use this as your `DATABASE_URL`

## Step 4: Initialize New Database Schema

```bash
# Push your current Prisma schema to the new database
yarn db:push

# Verify the schema was created correctly
yarn db:studio
```

## Step 5: Create Database Backup

```bash
# Create a backup of your current database (Node.js/Prisma based)
yarn db:backup
```

**Alternative backup methods:**

1. **If you have PostgreSQL tools installed locally:**

   ```bash
   yarn db:backup-pg
   ```

2. **If you want to install PostgreSQL tools:**

   ```bash
   # On macOS with Homebrew
   brew install postgresql

   # Then use the pg_dump method
   yarn db:backup-pg
   ```

## Step 6: Run Data Migration

```bash
# Run the migration script
yarn db:migrate-to-prisma
```

The migration script will:

- ✅ Test both database connections
- ✅ Migrate data in correct dependency order
- ✅ Use upsert operations to handle duplicates
- ✅ Validate data integrity after migration
- ✅ Provide detailed progress reports

## Step 7: Validation

After migration, the script will automatically validate:

- Record counts match between databases
- Critical data integrity checks
- Foreign key relationships

## Step 8: Clear Production Prisma Database

⚠️ **Important**: If your Prisma database contains development/test data that you want to remove before the migration:

**Option A: Full Reset (Recommended - Fastest)**

```bash
# This will drop and recreate all tables with fresh schema
yarn db:clear-prisma
```

**Option B: Data-Only Clear (Preserves Schema)**

```bash
# This will delete all data but keep the table structure
yarn db:clear-prisma-data
```

**Option C: Manual via Prisma Studio**

- Open `prisma studio` and manually delete records
- More time-consuming but gives you full control

## Step 9: Update Production Environment

1. **Update your production environment variables:**

   ```env
   DATABASE_URL="your_new_prisma_database_url"
   ```

2. **Deploy your application:**
   ```bash
   yarn build
   # Deploy to your hosting platform
   ```

## Step 9: Monitor and Verify

- [ ] Test critical application flows
- [ ] Verify user authentication works
- [ ] Check paycheck planning functionality
- [ ] Validate transaction data
- [ ] Test debt management features

## Rollback Plan (If Needed)

If something goes wrong:

1. **Revert environment variables:**

   ```env
   DATABASE_URL="your_old_database_url"
   ```

2. **Redeploy with old database**

3. **Investigate and fix issues**

## Migration Script Features

The `scripts/migrate-to-prisma-db.ts` script includes:

- **Safe upsert operations** - Won't duplicate data if run multiple times
- **Dependency-aware migration** - Migrates tables in correct order
- **Progress reporting** - Shows detailed progress for each table
- **Automatic validation** - Verifies data integrity after migration
- **Error handling** - Graceful failure with detailed error messages

## Troubleshooting

### Common Issues:

1. **Connection timeouts**
   - Increase connection timeout in Prisma client
   - Run migration during low-traffic hours

2. **Foreign key constraint errors**
   - Check that all referenced records exist
   - Migration script handles dependencies automatically

3. **Data type mismatches**
   - Verify Prisma schema matches your current database schema
   - Check for any custom data types that need conversion

### Getting Help:

- Check Prisma documentation: https://www.prisma.io/docs
- Review migration logs for specific error messages
- Test on staging environment first

## Post-Migration Cleanup

After successful migration and validation:

1. **Remove old database URL** from environment variables
2. **Update documentation** with new database information
3. **Monitor application performance** for a few days
4. **Keep database backup** for at least 30 days before deletion

## Performance Considerations

- **Large datasets**: Consider running migration in batches
- **Downtime**: Plan for 15-30 minutes of downtime for large databases
- **Monitoring**: Watch for performance changes after migration

---

**⚠️ Remember**: Always test this process on a staging environment first!
