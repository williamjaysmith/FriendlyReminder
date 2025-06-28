import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { sendReminderEmail } from '@/lib/email';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/types';
import { Query } from 'node-appwrite';

const CONTACTS_COLLECTION_ID = COLLECTIONS.CONTACTS;
const PROFILES_COLLECTION_ID = COLLECTIONS.PROFILES;

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request (you can add authentication here)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    console.log(`Checking for overdue reminders on ${today}`);

    // Find all contacts with overdue reminders where email_reminders is true
    const overdueContacts = await databases.listDocuments(
      DATABASE_ID,
      CONTACTS_COLLECTION_ID,
      [
        Query.equal('email_reminders', true),
        Query.lessThanEqual('next_reminder', today),
        Query.isNotNull('next_reminder')
      ]
    );

    console.log(`Found ${overdueContacts.documents.length} overdue contacts with email reminders enabled`);

    const emailResults = [];

    for (const contact of overdueContacts.documents) {
      try {
        // Get the user's profile to get their email
        const userProfile = await databases.getDocument(
          DATABASE_ID,
          PROFILES_COLLECTION_ID,
          contact.user_id
        );

        if (!userProfile.email) {
          console.log(`No email found for user ${contact.user_id}, skipping contact ${contact.name}`);
          continue;
        }

        // Calculate days since last conversation
        const lastConversationDate = new Date(contact.last_conversation);
        const todayDate = new Date();
        const daysSince = Math.floor((todayDate.getTime() - lastConversationDate.getTime()) / (1000 * 60 * 60 * 24));

        // Send reminder email
        const emailResult = await sendReminderEmail({
          recipientEmail: userProfile.email,
          recipientName: userProfile.name || 'there',
          contactName: contact.name,
          lastTalked: lastConversationDate.toLocaleDateString(),
          reminderDays: daysSince,
          contactId: contact.$id
        });

        emailResults.push({
          contactId: contact.$id,
          contactName: contact.name,
          recipientEmail: userProfile.email,
          success: true,
          emailId: emailResult?.id
        });

        console.log(`Sent reminder email for contact ${contact.name} to ${userProfile.email}`);

      } catch (error) {
        console.error(`Failed to send reminder for contact ${contact.name}:`, error);
        emailResults.push({
          contactId: contact.$id,
          contactName: contact.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${overdueContacts.documents.length} overdue contacts`,
      results: emailResults,
      sent: emailResults.filter(r => r.success).length,
      failed: emailResults.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('Error in reminder send API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow manual testing via GET request
export async function GET() {
  return NextResponse.json({
    message: 'Reminder API is running. Use POST with proper authentication to send reminders.',
    timestamp: new Date().toISOString()
  });
}