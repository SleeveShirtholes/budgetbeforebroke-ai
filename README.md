This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Management

This project uses [Drizzle ORM](https://orm.drizzle.team/) with [Neon](https://neon.tech/) as the database provider.

### Local Development

```bash
# Push schema changes to local database
yarn db:push

# Generate new migration files
yarn db:generate

# Open Drizzle Studio to view/edit data
yarn db:studio
```

### Production Database Migrations

When deploying to production, you'll need to run database migrations on your Neon database. Here's a step-by-step guide:

#### Prerequisites

1. **Install Drizzle Kit** (already included in devDependencies)
2. **Get your production DATABASE_URL** from Neon dashboard
3. **Ensure you have access** to run commands on your production environment

#### Method 1: Local Migration (Recommended for small teams)

```bash
# 1. Set your production database URL
export DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"

# 2. Verify the connection (optional but recommended)
yarn db:studio

# 3. Run all pending migrations
yarn db:migrate

# 4. Verify migrations were applied
yarn db:studio
```

#### Method 2: CI/CD Pipeline Migration

If you're using Vercel or another CI/CD platform:

```bash
# In your build/deploy script
export DATABASE_URL="your-production-database-url"
yarn db:migrate
```

#### Method 3: Direct Drizzle Kit Command

```bash
# Set environment variable
export DATABASE_URL="your-production-database-url"

# Run migrations directly
npx drizzle-kit migrate
```

#### Migration Safety Checklist

Before running production migrations:

- [ ] **Backup your database** (Neon provides automatic backups)
- [ ] **Test migrations locally** on a copy of production data
- [ ] **Verify DATABASE_URL** is correct for production
- [ ] **Check migration files** are in the correct order
- [ ] **Have a rollback plan** ready if needed

#### Troubleshooting

**Migration fails with "relation already exists"**
- The migration may have been partially applied
- Check your migration history in the `drizzle_migrations` table
- Consider manually fixing the schema or rolling back

**Connection issues**
- Verify your Neon database is running
- Check firewall settings and IP allowlists
- Ensure SSL mode is properly configured

**Permission errors**
- Verify your database user has the necessary privileges
- Check if you need to connect as a superuser for certain operations

#### Useful Commands

```bash
# View migration status
npx drizzle-kit introspect

# Generate new migration from schema changes
yarn db:generate

# Push schema changes (development only)
yarn db:push

# Open database studio
yarn db:studio
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
