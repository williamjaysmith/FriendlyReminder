import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { sendReminderEmail } from '@/lib/email';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/types';
import { Query } from 'node-appwrite';

const CONTACTS_COLLECTION_ID = COLLECTIONS.CONTACTS;
const PROFILES_COLLECTION_ID = COLLECTIONS.PROFILES;

export async function POST(request: NextRequest) {
  try {
    const { contactId, userEmail } = await request.json();

    if (!contactId || !userEmail) {
      return NextResponse.json(
        { error: 'contactId and userEmail are required' },
        { status: 400 }
      );
    }

    // Get the contact
    const contact = await databases.getDocument(
      DATABASE_ID,
      CONTACTS_COLLECTION_ID,
      contactId
    );

    // Get the user's profile
    const userProfiles = await databases.listDocuments(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      [Query.equal('email', userEmail)]
    );

    if (userProfiles.documents.length === 0) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const userProfile = userProfiles.documents[0];

    // Calculate days since last conversation
    const lastConversationDate = new Date(contact.last_conversation);
    const todayDate = new Date();
    const daysSince = Math.floor((todayDate.getTime() - lastConversationDate.getTime()) / (1000 * 60 * 60 * 24));

    // Send test reminder email
    const emailResult = await sendReminderEmail({
      recipientEmail: userProfile.email,
      recipientName: userProfile.name || 'there',
      contactName: contact.name,
      lastTalked: lastConversationDate.toLocaleDateString(),
      reminderDays: daysSince,
      contactId: contact.$id
    });

    return NextResponse.json({
      success: true,
      message: `Test reminder sent for contact ${contact.name}`,
      emailId: emailResult?.id,
      details: {
        contactName: contact.name,
        recipientEmail: userProfile.email,
        daysSince,
        lastTalked: lastConversationDate.toLocaleDateString()
      }
    });

  } catch (error) {
    console.error('Error in test reminder API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test reminder',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test reminder API endpoint',
    usage: 'POST with { "contactId": "contact_id", "userEmail": "user@example.com" }',
    timestamp: new Date().toISOString()
  });
}