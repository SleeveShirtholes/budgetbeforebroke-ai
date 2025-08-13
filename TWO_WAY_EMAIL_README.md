# Two-Way Email Conversations for Contact Form

This document explains how to set up and use the two-way email conversation system that allows users to reply to support emails and have full conversations tracked in the admin panel.

## 🚀 **Features**

- **Two-way communication**: Users can reply to support emails
- **Conversation threading**: All emails are linked to the original contact submission
- **Real-time updates**: Incoming emails automatically appear in the admin panel
- **Full conversation history**: View complete email threads in the admin interface
- **Automatic tracking**: Conversation IDs embedded in all outgoing emails

## 🔧 **Setup Requirements**

### 1. **Resend Webhook Configuration**

You need to configure Resend to send webhooks for incoming emails:

1. **Go to your Resend Dashboard**
2. **Navigate to Settings → Webhooks**
3. **Add a new webhook endpoint**:
   - **URL**: `https://yourdomain.com/api/webhooks/resend`
   - **Events**: Select `email.received`
   - **Secret**: Generate a secure secret (optional but recommended)

### 2. **Environment Variables**

Add these to your `.env.local`:

```bash
# Resend webhook secret (optional but recommended)
RESEND_WEBHOOK_SECRET=your_webhook_secret_here

# Support team email
SUPPORT_TEAM_EMAIL=support@yourdomain.com
```

### 3. **Domain Configuration**

For incoming emails to work, you need to:

1. **Configure your domain** in Resend to receive emails
2. **Set up MX records** to point to Resend's servers
3. **Verify domain ownership** in Resend dashboard

## 📧 **How It Works**

### **Outgoing Emails (Support → User)**

1. Support staff sends follow-up email via admin panel
2. Email includes conversation ID in subject/body
3. Email is stored in `email_conversations` table
4. User receives email with conversation tracking

### **Incoming Emails (User → Support)**

1. User replies to support email
2. Resend webhook sends email to `/api/webhooks/resend`
3. System extracts conversation ID from email
4. Email is stored in database and linked to submission
5. Admin panel shows updated conversation thread

## 🗄️ **Database Schema**

### **New Tables Added**

#### `email_conversations`

- Stores all email messages in conversations
- Links to contact submissions via `conversationId`
- Tracks message direction (inbound/outbound)
- Stores message type and metadata

#### **Updated `contact_submissions`**

- Added `conversationId` for threading
- Added `lastUserMessageAt` and `lastSupportMessageAt`
- Tracks conversation activity

## 🎯 **Admin Panel Features**

### **Conversation History**

- View complete email threads
- See both user and support messages
- Chronological order with timestamps
- Visual distinction between inbound/outbound

### **Real-time Updates**

- New user replies automatically appear
- No need to refresh the page
- Conversation status updates in real-time

## 📱 **User Experience**

### **For Users**

- Reply to any support email
- Maintain conversation context
- Professional email experience
- No need to reference ticket numbers

### **For Support Staff**

- Full conversation history
- Context-aware responses
- Professional communication
- Easy follow-up management

## 🔒 **Security Features**

- **Webhook verification**: Optional secret validation
- **Email sanitization**: Raw emails stored for debugging
- **Access control**: Admin-only access to conversations
- **Audit trail**: All communications logged

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Webhooks not receiving emails**

   - Check Resend webhook configuration
   - Verify domain MX records
   - Check webhook endpoint accessibility

2. **Conversations not linking**

   - Verify conversation IDs in emails
   - Check email headers and formatting
   - Review webhook processing logs

3. **Admin panel not updating**
   - Check database connections
   - Verify webhook processing
   - Review browser console for errors

### **Debug Mode**

Enable debug logging by checking:

- Server console for webhook processing
- Database for conversation storage
- Email delivery status in Resend

## 🔄 **Workflow Example**

1. **User submits contact form**

   - Creates submission with conversation ID
   - Sends confirmation email

2. **Support responds**

   - Uses admin panel to send follow-up
   - Email includes conversation ID
   - Response stored in database

3. **User replies**

   - Reply automatically processed via webhook
   - Added to conversation thread
   - Admin panel updates in real-time

4. **Ongoing conversation**
   - Full thread visible in admin
   - Support can see complete context
   - Professional communication maintained

## 🎉 **Benefits**

- **Better customer service**: Full conversation context
- **Professional appearance**: Proper email threading
- **Efficiency**: No lost context or duplicate explanations
- **Tracking**: Complete audit trail of communications
- **Scalability**: Handles multiple ongoing conversations

## 🔮 **Future Enhancements**

- **Email templates**: Pre-written responses
- **Auto-responses**: Automated acknowledgment emails
- **Escalation**: Route complex issues to senior staff
- **Analytics**: Response time and satisfaction metrics
- **Integration**: Connect with help desk systems

---

## 📞 **Support**

If you need help setting up or using this system:

1. Check the troubleshooting section above
2. Review Resend documentation for webhook setup
3. Verify your domain configuration
4. Check server logs for error messages

The system is designed to be robust and user-friendly, providing a professional support experience for both users and support staff.
