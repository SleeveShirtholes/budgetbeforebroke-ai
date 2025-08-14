# SMS Budgeting Feature

This feature allows users to manage their budget and transactions via text messages using Twilio SMS.

## Features

- **Transaction Management**: Add expenses and income via SMS
- **Budget Queries**: Check budget balances for categories
- **Auto-categorization**: Automatically creates categories from transaction descriptions
- **Real-time Feedback**: Immediate confirmation with budget remaining info
- **Help System**: Built-in help commands for user guidance
- **Phone Verification**: Secure phone number verification system

## Setup

### 1. Twilio Configuration

1. Sign up for a [Twilio account](https://www.twilio.com/try-twilio)
2. Get a Twilio phone number
3. Add environment variables to your `.env.local`:

```env
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### 2. Webhook Configuration

Configure your Twilio phone number webhook URL to point to:

```
https://yourdomain.com/api/sms/webhook
```

Set the HTTP method to `POST`.

### 3. User Phone Setup

Users need to add and verify their phone number through the web interface:

1. Go to profile/settings page
2. Use the `PhoneNumberManager` component
3. Enter phone number and verify with SMS code

## Usage

### Transaction Commands

Users can send natural language messages to add transactions:

**Expenses:**

- `"Spent $25 on groceries"`
- `"Paid $50 for gas"`
- `"Bought $15 coffee"`
- `"$30 for lunch"`

**Income:**

- `"Income $500 freelance work"`
- `"Earned $100 side hustle"`
- `"Received $200 from mom"`

### Budget Commands

**Check specific category:**

- `"Budget groceries"`
- `"Balance gas"`

**Check all categories:**

- `"Budget"`
- `"Balance"`

### Help Command

- `"help"` or `"?"` - Shows complete help menu

## Message Parsing

The system uses intelligent parsing to extract:

- **Amount**: Recognizes `$25`, `25`, `$25.50` formats
- **Type**: Detects income vs expense keywords
- **Category**: Extracts from prepositions (on, for, at) or description
- **Description**: Remaining text after amount and category extraction

### Examples:

| Input                        | Amount | Type    | Category       | Description |
| ---------------------------- | ------ | ------- | -------------- | ----------- |
| "Spent $25 on groceries"     | 25.00  | expense | groceries      | Spent       |
| "Income $500 freelance work" | 500.00 | income  | freelance work | Income      |
| "$30 lunch meeting"          | 30.00  | expense | lunch meeting  | -           |

## Response System

The system provides rich feedback:

**Transaction Confirmation:**

```
✅ Expense recorded: $25.00 - Spent (groceries)

💰 groceries budget remaining: $175.00
```

**Budget Query Response:**

```
💰 Groceries Budget:
Allocated: $200.00
Spent: $125.00
Remaining: $75.00
```

**Budget Summary:**

```
📊 Budget Summary (12/2024):

Groceries: $75.00 remaining
Gas: $45.00 remaining
Entertainment: $15.00 remaining
```

## Security

- **Webhook Validation**: Validates Twilio signatures to ensure requests come from Twilio
- **Phone Verification**: 6-digit SMS verification before enabling SMS features
- **User Matching**: Messages only processed for verified phone numbers
- **Rate Limiting**: Built-in protection against spam

## Error Handling

- **Invalid Format**: Helpful parsing error messages
- **Unrecognized User**: Prompts to verify phone number
- **Missing Budget**: Guides user to set up budgets
- **System Errors**: Graceful fallback with retry suggestions

## Database Changes

The system uses existing schema with these key tables:

- `user` - Stores user phone numbers
- `transactions` - Transaction data
- `categories` - Auto-created categories
- `budgets` - Monthly budget allocations
- `budget_categories` - Category budget amounts

## API Endpoints

### SMS Webhook

- **POST** `/api/sms/webhook`
- Receives Twilio webhook requests
- Processes SMS messages and returns TwiML responses

### Phone Management

- **POST** `/api/user/phone` - Send verification code
- **PATCH** `/api/user/phone` - Verify phone number
- **DELETE** `/api/user/phone` - Remove phone number

## Components

### PhoneNumberManager

React component for phone number management:

- Add phone number
- Verify with SMS code
- Remove phone number
- Display SMS commands help

## Testing

### Development Testing

1. Use [Twilio Console](https://console.twilio.com) to send test messages
2. Use ngrok for local webhook testing:
   ```bash
   ngrok http 3000
   ```
3. Update Twilio webhook URL to ngrok URL

### Production Testing

- Test all message formats
- Verify webhook signature validation
- Test error scenarios
- Load test with multiple users

## Troubleshooting

### Common Issues

1. **Webhook not receiving messages**

   - Check Twilio webhook URL configuration
   - Verify HTTPS endpoint (required for production)
   - Check webhook logs in Twilio Console

2. **Signature validation failing**

   - Ensure `TWILIO_AUTH_TOKEN` is correct
   - Check webhook URL matches exactly
   - Verify request method is POST

3. **Messages not parsing**

   - Check message format examples
   - Ensure amount includes $ or numeric value
   - Try simpler message formats

4. **User not found**
   - Verify phone number is added to user account
   - Check phone number formatting (+1 prefix for US)
   - Ensure verification was completed

## Future Enhancements

- **Receipt Photos**: Process images for transaction details
- **Recurring Transactions**: Set up recurring SMS commands
- **Budget Alerts**: Proactive spending notifications
- **Multi-language**: Support for different languages
- **Voice Commands**: Integration with voice assistants
- **AI Enhancement**: Better natural language processing

## Dependencies

- `twilio` - SMS API integration
- `drizzle-orm` - Database operations
- `zod` - Input validation
- `nanoid` - ID generation

## Contributing

When adding SMS features:

1. Update message parsing in `sms-processor.ts`
2. Add new response templates
3. Update help message
4. Add tests for new formats
5. Update this documentation
