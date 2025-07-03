// Appwrite Database Configuration
export const DATABASE_ID = 'friendly-reminder-db'

// Collection IDs
export const COLLECTIONS = {
  PROFILES: 'profiles',
  CONTACTS: 'contacts', 
  TAGS: 'tags',
  CONTACT_TAGS: 'contact_tags',
  SOCIAL_LINKS: 'social_links',
  CONVERSATIONS: 'conversations'
} as const

// Document interfaces matching Supabase schema
export interface ProfileDocument {
  $id: string
  user_id: string
  username?: string
  email?: string
  $createdAt: string
  $updatedAt: string
}

export interface ContactDocument {
  $id: string
  user_id: string
  name: string
  email?: string
  gender?: string
  birthday?: string
  description?: string
  work_company?: string
  work_position?: string
  how_we_met?: string
  interests?: string
  last_conversation?: string
  reminder_days: number
  next_reminder?: string
  birthday_reminder: boolean
  $createdAt: string
  $updatedAt: string
}

export interface TagDocument {
  $id: string
  user_id: string
  name: string
  color?: string
  $createdAt: string
}

export interface ContactTagDocument {
  $id: string
  contact_id: string
  tag_id: string
}

export interface SocialLinkDocument {
  $id: string
  contact_id: string
  platform: string
  url: string
  $createdAt: string
}

export interface ConversationDocument {
  $id: string
  contact_id: string
  notes: string
  date: string
  $createdAt: string
}