// Core entity types for the application
export interface Contact {
  id: string
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
  email_reminders: boolean
  created_at: string
  updated_at: string
  tags?: Tag[]
  social_links?: SocialLink[]
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color?: string
  created_at: string
}

export interface SocialLink {
  id: string
  contact_id: string
  platform: string
  url: string
  created_at: string
}

export interface Conversation {
  id: string
  contact_id: string
  notes: string
  date: string
  created_at: string
}

export interface Profile {
  id: string
  username?: string
  email?: string
  created_at: string
  updated_at: string
}

// Common field unions for type safety
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say'
export type SocialPlatform = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'github' | 'website' | 'other'

// Entity with relationships
export interface ContactWithRelations extends Contact {
  tags: Tag[]
  social_links: SocialLink[]
  conversations: Conversation[]
}

// Partial types for updates
export type ContactUpdate = Partial<Omit<Contact, 'id' | 'user_id' | 'created_at'>>
export type TagUpdate = Partial<Omit<Tag, 'id' | 'user_id' | 'created_at'>>
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>