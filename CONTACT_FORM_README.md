# Contact Form System

This document describes the enhanced contact form system that includes database storage and support team notifications.

## Features

### 1. **Database Storage**

- All contact form submissions are automatically saved to the `contact_submission` table
- Includes metadata like IP address, user agent, and timestamps
- Supports status tracking (new, in_progress, resolved, closed)
- Allows internal notes for support team

### 2. **Email Notifications**

- **User Confirmation**: Users receive an immediate confirmation email
- **Support Team Notification**: Support staff are notified of new submissions
- Both emails use professional templates with consistent branding

### 3. **Admin Interface**

- View all contact submissions at `/admin/contact-submissions`
- Update submission status and add internal notes
- Track resolution progress

## Database Schema

```sql
CREATE TABLE "contact_submission" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "subject" text NOT NULL,
  "message" text NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "status" text DEFAULT 'new' NOT NULL,
  "assigned_to" text REFERENCES "user"("id"),
  "notes" text,
  "resolved_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# Required
RESEND_API_KEY=your_resend_api_key

# Optional (defaults to support@budgetbeforebroke.com)
SUPPORT_TEAM_EMAIL=your_support_email@domain.com
```

## API Endpoint

**POST** `/api/contact`

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "I have a question about your service..."
}
```

### Response

```json
{
  "success": true,
  "message": "Thank you for your message! We'll get back to you within 24 hours. Check your email for a confirmation.",
  "submissionId": "generated_submission_id"
}
```

## Email Templates

### User Confirmation Email

- **Template**: `src/lib/email-templates/contact-confirmation.tsx`
- **Content**: Confirmation message with user's submitted details
- **Purpose**: Let users know their message was received

### Support Team Notification

- **Template**: `src/lib/email-templates/support-notification.tsx`
- **Content**: Submission details, metadata, and user message
- **Purpose**: Alert support team to new inquiries

## Admin Actions

### View Submissions

```typescript
import { getContactSubmissions } from "@/app/actions/contact";

const result = await getContactSubmissions();
if (result.success) {
  const submissions = result.submissions;
  // Process submissions
}
```

### Update Status

```typescript
import { updateContactSubmissionStatus } from "@/app/actions/contact";

const result = await updateContactSubmissionStatus(
  submissionId,
  "in_progress",
  "Working on this issue",
);
```

## Status Workflow

1. **new** - Initial submission status
2. **in_progress** - Support team is working on it
3. **resolved** - Issue has been resolved
4. **closed** - Submission is closed (no further action needed)

## Error Handling

The system is designed to be resilient:

- If email sending fails, the form submission still succeeds
- Database errors are logged and return appropriate error responses
- Validation errors provide clear feedback to users

## Testing

Run the test suite to ensure everything works correctly:

```bash
yarn test src/app/api/contact/__tests__/route.test.ts
```

## Migration

After adding the new database schema, run:

```bash
yarn drizzle-kit generate
yarn drizzle-kit migrate
```

## Security Considerations

- Form data is validated using Zod schemas
- IP addresses and user agents are logged for support purposes
- No sensitive data is exposed in error messages
- Rate limiting should be implemented at the API level if needed

## Future Enhancements

Potential improvements to consider:

- Rate limiting for form submissions
- Spam detection and filtering
- File attachment support
- Integration with help desk software
- Automated response templates
- Submission analytics and reporting
