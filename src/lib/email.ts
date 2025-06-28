import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export interface ReminderEmailData {
  recipientEmail: string;
  recipientName: string;
  contactName: string;
  lastTalked: string;
  reminderDays: number;
  contactId: string;
}

export async function sendReminderEmail({
  recipientEmail,
  recipientName,
  contactName,
  lastTalked,
  reminderDays,
  contactId
}: ReminderEmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const contactUrl = `${baseUrl}/contacts/${contactId}`;

  const { data, error } = await resend.emails.send({
    from: 'Friendly Reminder <reminders@friendlyreminder.app>',
    to: [recipientEmail],
    subject: `Time to reach out to ${contactName}`,
    html: generateReminderEmailHTML({
      recipientName,
      contactName,
      lastTalked,
      reminderDays,
      contactUrl
    }),
    text: generateReminderEmailText({
      recipientName,
      contactName,
      lastTalked,
      reminderDays,
      contactUrl
    })
  });

  if (error) {
    console.error('Failed to send reminder email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

function generateReminderEmailHTML({
  recipientName,
  contactName,
  lastTalked,
  reminderDays,
  contactUrl
}: {
  recipientName: string;
  contactName: string;
  lastTalked: string;
  reminderDays: number;
  contactUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Time to reach out to ${contactName}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📱 Friendly Reminder</h1>
    <p>Time to reconnect!</p>
  </div>
  
  <div class="content">
    <p>Hi ${recipientName},</p>
    
    <p>It's been <strong>${reminderDays} days</strong> since you last talked to <strong>${contactName}</strong> on ${lastTalked}.</p>
    
    <p>Now might be a great time to reach out and see how they're doing!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${contactUrl}" class="button">View Contact Details</a>
    </div>
    
    <p>You can update your conversation history and set new reminders once you've reconnected.</p>
  </div>
  
  <div class="footer">
    <p>You're receiving this because you enabled email reminders for ${contactName}.</p>
    <p>Manage your reminder preferences in the <a href="${contactUrl}">contact details</a>.</p>
  </div>
</body>
</html>
  `.trim();
}

function generateReminderEmailText({
  recipientName,
  contactName,
  lastTalked,
  reminderDays,
  contactUrl
}: {
  recipientName: string;
  contactName: string;
  lastTalked: string;
  reminderDays: number;
  contactUrl: string;
}) {
  return `
Hi ${recipientName},

It's been ${reminderDays} days since you last talked to ${contactName} on ${lastTalked}.

Now might be a great time to reach out and see how they're doing!

View contact details: ${contactUrl}

You can update your conversation history and set new reminders once you've reconnected.

---
You're receiving this because you enabled email reminders for ${contactName}.
Manage your reminder preferences in the contact details.
  `.trim();
}