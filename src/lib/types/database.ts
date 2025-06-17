export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          gender: string | null
          birthday: string | null
          description: string | null
          work_company: string | null
          work_position: string | null
          how_we_met: string | null
          interests: string | null
          last_conversation: string | null
          reminder_days: number
          next_reminder: string | null
          birthday_reminder: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          gender?: string | null
          birthday?: string | null
          description?: string | null
          work_company?: string | null
          work_position?: string | null
          how_we_met?: string | null
          interests?: string | null
          last_conversation?: string | null
          reminder_days?: number
          next_reminder?: string | null
          birthday_reminder?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          gender?: string | null
          birthday?: string | null
          description?: string | null
          work_company?: string | null
          work_position?: string | null
          how_we_met?: string | null
          interests?: string | null
          last_conversation?: string | null
          reminder_days?: number
          next_reminder?: string | null
          birthday_reminder?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          created_at?: string
        }
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
        }
      }
      social_links: {
        Row: {
          id: string
          contact_id: string
          platform: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          platform: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          platform?: string
          url?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          contact_id: string
          notes: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          notes: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          notes?: string
          date?: string
          created_at?: string
        }
      }
    }
  }
}