# Email Reminders Setup Guide

This guide explains how to set up email reminders for your Friendly Reminder app.

## Overview
The email functionality includes:
- ✅ Daily email reminders for overdue contacts
- ✅ Birthday reminder emails
- ✅ User preferences for email notifications
- ✅ Automated scheduling via Supabase Edge Functions

## Setup Steps

### 1. Database Migration
First, apply the database migration to add email preferences:

```sql
-- Run this in your Supabase SQL editor
ALTER TABLE public.contacts ADD COLUMN email_reminders BOOLEAN DEFAULT false NOT NULL;
```

Or use the migration file:
```bash
supabase db push
```

### 2. Email Service Setup (Resend)

1. Sign up for [Resend](https://resend.com/)
2. Get your API key from the dashboard
3. Add the API key to your Supabase environment variables:
   - Go to Project Settings > Edge Functions
   - Add `RESEND_API_KEY` with your API key value

### 3. Deploy the Email Function

**Option A: Supabase CLI (Recommended)**
```bash
# First, login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-reminders

# Set environment variables
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

**Option B: SQL Functions (Easier Setup)**
If you prefer not to use Edge Functions, run the SQL migration:
```bash
supabase db push
```

This creates SQL functions that queue emails. You can then:
1. Test: `SELECT * FROM test_email_reminders();`
2. Queue emails: `SELECT * FROM queue_reminder_emails();`
3. Set up a cron job via pg_cron or external scheduler

### 4. Environment Variables Required

Make sure these environment variables are set in your Supabase project:

- `RESEND_API_KEY` - Your Resend API key
- `SUPABASE_URL` - Your Supabase project URL (automatically available)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (automatically available)

### 5. Configure Email Domain

Update the email sender in the Edge Function:
1. Open `supabase/functions/send-reminders/index.ts`
2. Replace `noreply@yourdomain.com` with your verified domain
3. Replace `https://yourdomain.com` with your app's URL

### 6. Verify Setup

Test the email functionality:

```bash
# Test the function manually
supabase functions invoke send-reminders
```

## How It Works

### Email Reminders
- Runs daily at 9 AM UTC
- Finds contacts where `next_reminder <= today` AND `email_reminders = true`
- Sends personalized emails to contact owners
- Includes contact details and quick actions

### Birthday Reminders
- Runs daily at 9 AM UTC  
- Finds contacts where birthday matches today's date AND `birthday_reminder = true`
- Sends birthday notification emails to contact owners

### User Experience
- Users can enable/disable email reminders per contact
- Users can enable/disable birthday reminders per contact
- Checkboxes are available in the contact detail page under "Reminder Settings"

## Customization

### Email Templates
Edit the HTML templates in `supabase/functions/send-reminders/index.ts`:
- Customize the email design
- Add your branding
- Modify the messaging

### Schedule Changes
Modify the cron schedule in the Supabase Dashboard:
- `"0 9 * * *"` - Daily at 9 AM UTC
- `"0 9 * * 1-5"` - Weekdays only at 9 AM UTC  
- `"0 */6 * * *"` - Every 6 hours

### Alternative Email Providers
Replace Resend with another provider by updating the fetch request in the Edge Function.

## Troubleshooting

### Common Issues

1. **Emails not sending**: Check your Resend API key and domain verification
2. **Function not running**: Verify the cron job is set up in Supabase Dashboard
3. **Wrong email addresses**: Ensure user profiles have valid email addresses
4. **Database errors**: Check that the migration was applied successfully

### Logs
Check function logs in Supabase Dashboard > Edge Functions > send-reminders > Logs

### Manual Testing
You can test individual components:
- Database queries in SQL editor
- Email sending via Resend dashboard
- Function execution via CLI

## Next Steps

Consider these enhancements:
- Email preferences dashboard
- Email templates customization UI
- Weekly/monthly summary emails
- Integration with calendar systems
- Advanced filtering and grouping