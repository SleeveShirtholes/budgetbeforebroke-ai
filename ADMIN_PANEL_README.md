# Admin Panel Documentation

## Overview

This comprehensive admin panel provides full administrative control over your Budget Before Broke application. It features database table management, user administration, system analytics, and security controls.

## Features

### 🛡️ Security & Authentication

- **Global Admin Role System**: Secure admin-only access with role-based permissions
- **Protected Routes**: All admin routes require authentication and admin privileges
- **Session Management**: Integrated with Better Auth for secure session handling

### 📊 Database Management

- **Universal Table Management**: View, create, edit, and delete records from all database tables
- **Dynamic Schema Detection**: Automatically detects table schemas and field types
- **Search & Filtering**: Full-text search across searchable fields
- **Pagination**: Efficient pagination for large datasets
- **Sorting**: Sort by any column in ascending or descending order

### 📈 Analytics & Monitoring

- **System Statistics**: Real-time statistics for users, transactions, and more
- **Database Metrics**: Record counts and table health monitoring
- **System Health**: Monitor database connections and performance
- **Recent Activity**: Track recent database changes and activity

### 👥 User Administration

- **Admin User Management**: Grant or revoke global admin access
- **User Search**: Find users by email address
- **Role Management**: Manage user permissions and access levels

### ⚙️ System Configuration

- **Global Settings**: Configure system-wide settings and preferences
- **Feature Toggles**: Enable/disable features like registration and notifications
- **Maintenance Mode**: Put the system into maintenance mode when needed

## Installation & Setup

### 1. Database Schema Updates

The admin panel requires a new `isGlobalAdmin` field in the user table. This has been added to the schema:

```typescript
// In src/db/schema.ts
export const user = pgTable("user", {
  // ... existing fields
  isGlobalAdmin: boolean("is_global_admin").notNull().default(false),
  // ... rest of fields
});
```

To apply the schema changes:

```bash
# Push the schema changes to your database
npx drizzle-kit push
```

### 2. Dependencies

The admin panel uses these additional dependencies:

```bash
yarn add react-hot-toast  # For notifications
```

### 3. Environment Variables

Ensure your `.env` file includes:

```env
DATABASE_URL="your_postgresql_connection_string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Usage

### Accessing the Admin Panel

1. **Sign in** to your account
2. **Get Admin Access**: Have an existing admin grant you admin privileges, or manually set `isGlobalAdmin = true` in the database for your user
3. **Navigate** to `/admin` to access the admin dashboard

### Creating Your First Admin User

Since this is a new installation, you'll need to manually create your first admin user:

```sql
-- Replace 'your-user-id' with your actual user ID from the database
UPDATE "user" SET is_global_admin = true WHERE id = 'your-user-id';
```

### Admin Panel Structure

```
/admin/                          # Admin dashboard overview
├── tables/                      # Database table management
│   ├── [tableName]/            # Individual table management
│   └── components/             # Table management components
├── contact-submissions/        # Existing contact form management
├── settings/                   # Admin user and system settings
├── analytics/                  # System analytics and monitoring
└── components/                 # Shared admin components
```

## Database Tables Available

The admin panel provides management for all database tables:

### Core Tables

- **Users**: User accounts and authentication
- **Budget Accounts**: Account management and settings
- **Budgets**: Budget planning and allocation
- **Categories**: Spending categories
- **Transactions**: Financial transactions
- **Goals**: Financial goals and targets

### Support & Communication

- **Contact Submissions**: Contact form submissions
- **Email Conversations**: Support email threads
- **Support Requests**: User support tickets
- **Support Comments**: Comments on support requests

### Financial Management

- **Income Sources**: User income tracking
- **Debts**: Debt management and tracking
- **Debt Allocations**: Debt payment allocations
- **Monthly Debt Planning**: Debt planning by month

### System Tables

- **Sessions**: User sessions
- **Accounts**: OAuth and authentication accounts
- **Passkeys**: WebAuthn passkey management
- **Verification**: Email verification tokens

## Security Considerations

### Admin Access Control

- Only users with `isGlobalAdmin = true` can access the admin panel
- All admin routes are protected by middleware
- Admin actions are logged and auditable

### Database Safety

- Sensitive tables have limited editable fields
- Authentication-related tables are mostly read-only
- Critical system fields are protected from modification

### Production Recommendations

1. **Limit Admin Users**: Only grant admin access to trusted personnel
2. **Regular Audits**: Regularly review admin user list and recent actions
3. **Database Backups**: Ensure regular database backups before using admin functions
4. **Staging Environment**: Test admin changes in staging before production

## API Reference

### Server Actions

The admin panel uses several server actions in `/app/actions/admin.ts`:

```typescript
// Get all available tables
getAvailableTables(): Promise<TableInfo[]>

// Get table data with pagination
getTableData(tableName: TableName, page?: number, pageSize?: number, searchTerm?: string): Promise<TableDataResult>

// CRUD operations
getTableRecord(tableName: TableName, id: string): Promise<RecordResult>
createTableRecord(tableName: TableName, data: Record<string, any>): Promise<RecordResult>
updateTableRecord(tableName: TableName, id: string, data: Record<string, any>): Promise<RecordResult>
deleteTableRecord(tableName: TableName, id: string): Promise<RecordResult>

// Schema information
getTableSchema(tableName: TableName): Promise<SchemaResult>
```

### Authentication Helpers

Helper functions in `/lib/auth-helpers.ts`:

```typescript
// Get current user
getCurrentUser(): Promise<User | null>
getCurrentUserWithAdmin(): Promise<UserWithAdmin | null>

// Admin checks
isCurrentUserGlobalAdmin(): Promise<boolean>
requireGlobalAdmin(): Promise<UserWithAdmin>
```

## Customization

### Adding New Tables

To add management for new database tables:

1. Add the table to `TABLE_CONFIGS` in `/app/actions/admin.ts`
2. Define editable and searchable fields
3. Add appropriate field type mappings

Example:

```typescript
newTable: {
  table: schema.newTable,
  editableFields: ["name", "description", "status"],
  searchFields: ["name", "description"],
},
```

### Custom Field Types

Add new field type handling in `TableRecordModal.tsx`:

```typescript
case 'custom-type':
  return (
    <CustomComponent
      key={field.name}
      {...commonProps}
    />
  );
```

### Navigation Customization

Modify the admin sidebar navigation in `/app/admin/components/AdminSidebar.tsx`:

```typescript
const navigation = [
  { name: "Custom Page", href: "/admin/custom", icon: CustomIcon },
  // ... existing items
];
```

## Troubleshooting

### Common Issues

1. **Access Denied**: Ensure your user has `isGlobalAdmin = true` in the database
2. **Database Connection**: Verify `DATABASE_URL` environment variable is set correctly
3. **Missing Dependencies**: Run `yarn install` to ensure all packages are installed
4. **Schema Mismatches**: Run `npx drizzle-kit push` to sync schema changes

### Error Messages

- `"Authentication required"`: User is not signed in
- `"Global admin access required"`: User doesn't have admin privileges
- `"Table not found"`: Invalid table name or configuration issue
- `"Record not found"`: Attempting to operate on non-existent record

## Contributing

When contributing to the admin panel:

1. **Security First**: Always verify admin permission checks
2. **Documentation**: Update this README for new features
3. **Error Handling**: Implement proper error handling and user feedback
4. **Testing**: Test admin functions thoroughly in development
5. **Backup**: Always backup data before testing destructive operations

## Support

For issues or questions regarding the admin panel:

1. Check this documentation first
2. Verify database and environment setup
3. Review error logs for specific issues
4. Test with minimal data first

## License

This admin panel is part of the Budget Before Broke application and follows the same licensing terms.
