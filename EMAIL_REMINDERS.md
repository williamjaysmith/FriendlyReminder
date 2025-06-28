# Email Reminder System

The Friendly Reminder app now includes an automated email reminder system that sends notifications when it's time to reach out to your contacts.

## How It Works

1. **Contact Settings**: Enable email reminders for individual contacts in their detail page
2. **Automatic Scheduling**: The system calculates reminder dates based on your last conversation + reminder interval
3. **Daily Check**: Every day at 9 AM (UTC), the system checks for overdue reminders
4. **Email Delivery**: Sends personalized reminder emails via Resend

## Setup

### Environment Variables Required

Add these to your `.env.local` file:

```env
# Email service
RESEND_API_KEY=your_resend_api_key

# Cron authentication (generate a secure random string)
CRON_SECRET=your-secret-cron-token-here

# App URL for email links
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

### Deployment Configuration

**For Vercel (Recommended):**
- The `vercel.json` file is already configured with a daily cron job
- Cron runs at 9 AM UTC daily: `"schedule": "0 9 * * *"`
- Make sure to add environment variables in your Vercel dashboard

**For Other Platforms:**
- Set up a daily cron job to POST to `/api/reminders/send`
- Include `Authorization: Bearer your-cron-secret` header
- Schedule for once daily (recommended: morning hours in your timezone)

## API Endpoints

### `/api/reminders/send` (POST)
- **Purpose**: Main cron endpoint that sends all overdue reminders
- **Authentication**: Requires `Authorization: Bearer {CRON_SECRET}` header
- **Schedule**: Called daily by cron job
- **Response**: Summary of emails sent/failed

### `/api/reminders/test` (POST)
- **Purpose**: Manual testing endpoint for specific contacts
- **Body**: `{ "contactId": "contact_id", "userEmail": "user@example.com" }`
- **Use**: Test email functionality during development

## Email Content

The reminder emails include:
- Personalized greeting using the user's name
- Contact name and last conversation date
- Days since last contact
- Direct link to contact details
- Professional, friendly tone encouraging reconnection

## Testing

1. **Manual Test**: Use the test endpoint to send a sample email
2. **Contact Setup**: Create a contact with email reminders enabled and a past due date
3. **Cron Test**: Trigger the cron endpoint manually with proper authentication

## Security

- Cron endpoints are protected with secret token authentication
- User data is accessed through Appwrite's RLS policies
- Email addresses are validated before sending
- Failed emails are logged for debugging

## Monitoring

- Check your application logs for email sending status
- Monitor Resend dashboard for delivery statistics
- Failed emails are logged with error details for troubleshooting