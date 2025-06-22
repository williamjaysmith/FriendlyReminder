import { ContactDocument } from './types'
import { Contact } from '../types'

export function mapDocumentToContact(doc: ContactDocument): Contact {
  return {
    id: doc.$id,
    user_id: doc.user_id,
    name: doc.name,
    email: doc.email,
    gender: doc.gender,
    birthday: doc.birthday,
    description: doc.description,
    work_company: doc.work_company,
    work_position: doc.work_position,
    how_we_met: doc.how_we_met,
    interests: doc.interests,
    last_conversation: doc.last_conversation,
    reminder_days: doc.reminder_days,
    next_reminder: doc.next_reminder,
    birthday_reminder: doc.birthday_reminder,
    email_reminders: doc.email_reminders,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt
  }
}

export function mapContactToDocument(contact: Partial<Contact>): Partial<ContactDocument> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = { ...contact }
  
  // Remove id if it exists (Appwrite uses $id)
  if (doc.id) {
    delete doc.id
  }
  
  // Remove timestamps (Appwrite manages these)
  if (doc.created_at) {
    delete doc.created_at
  }
  if (doc.updated_at) {
    delete doc.updated_at
  }
  
  return doc as Partial<ContactDocument>
}