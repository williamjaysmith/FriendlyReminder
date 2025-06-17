export type { Database } from './database'

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