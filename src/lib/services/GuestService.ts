import { Contact, User, ConversationEntry } from '@/lib/types/entities';
import { localStorage } from '@/lib/utils/storage';

export class GuestService {
  private static readonly GUEST_USER_KEY = 'guest_user';
  private static readonly GUEST_CONTACTS_KEY = 'guest_contacts';
  private static readonly GUEST_CONVERSATIONS_KEY = 'guest_conversations';

  static readonly GUEST_USER: User = {
    id: 'guest',
    email: 'guest@example.com',
    name: 'Guest User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_guest: true
  };

  static readonly DUMMY_CONTACTS: Contact[] = [
    {
      id: 'contact-1',
      user_id: 'guest',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      birthday: '1990-05-15',
      description: 'Met at the tech conference. Works at Google on AI/ML projects.',
      birthday_reminder: true,
      reminder_days: 30,
      last_conversation: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-1', contact_id: 'contact-1', platform: 'LinkedIn', url: 'https://linkedin.com/in/alice-johnson', created_at: new Date().toISOString() },
        { id: 'social-2', contact_id: 'contact-1', platform: 'GitHub', url: 'https://github.com/alice-johnson', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-2',
      user_id: 'guest',
      name: 'Bob Martinez',
      email: 'bob@example.com',
      birthday: '1985-11-22',
      description: 'College friend, now working as a designer at Adobe. Loves hiking.',
      birthday_reminder: true,
      reminder_days: 60,
      last_conversation: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-3', contact_id: 'contact-2', platform: 'Instagram', url: 'https://instagram.com/bob.martinez', created_at: new Date().toISOString() },
        { id: 'social-4', contact_id: 'contact-2', platform: 'Behance', url: 'https://behance.net/bob-martinez', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-3',
      user_id: 'guest',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      birthday: '1992-03-08',
      description: 'Startup founder in the fintech space. Very passionate about sustainable investing.',
      birthday_reminder: true,
      reminder_days: 14,
      last_conversation: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-5', contact_id: 'contact-3', platform: 'Twitter', url: 'https://twitter.com/sarah_chen', created_at: new Date().toISOString() },
        { id: 'social-6', contact_id: 'contact-3', platform: 'LinkedIn', url: 'https://linkedin.com/in/sarah-chen', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-4',
      user_id: 'guest',
      name: 'David Kim',
      email: 'david@example.com',
      birthday: '1988-07-30',
      description: 'Former coworker, now product manager at Microsoft. Has two kids.',
      birthday_reminder: true,
      reminder_days: 45,
      last_conversation: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-7', contact_id: 'contact-4', platform: 'LinkedIn', url: 'https://linkedin.com/in/david-kim', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-5',
      user_id: 'guest',
      name: 'Emma Thompson',
      email: 'emma@example.com',
      birthday: '1995-12-12',
      description: 'Yoga instructor and wellness coach. Met at the local coffee shop.',
      birthday_reminder: true,
      reminder_days: 21,
      last_conversation: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-8', contact_id: 'contact-5', platform: 'Instagram', url: 'https://instagram.com/emma.wellness', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-6',
      user_id: 'guest',
      name: 'Michael Rodriguez',
      email: 'michael@example.com',
      birthday: '1987-07-08',
      description: 'Real estate agent who helped me find my apartment. Very knowledgeable about the local market.',
      birthday_reminder: true,
      reminder_days: 90,
      last_conversation: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-9', contact_id: 'contact-6', platform: 'LinkedIn', url: 'https://linkedin.com/in/michael-rodriguez', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-7',
      user_id: 'guest',
      name: 'Jessica Williams',
      email: 'jessica@example.com',
      birthday: '1993-07-12',
      description: 'Graphic designer and artist. Met at the local art gallery opening. Very creative and inspiring.',
      birthday_reminder: true,
      reminder_days: 28,
      last_conversation: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-10', contact_id: 'contact-7', platform: 'Instagram', url: 'https://instagram.com/jessica.art', created_at: new Date().toISOString() },
        { id: 'social-11', contact_id: 'contact-7', platform: 'Behance', url: 'https://behance.net/jessica-williams', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-8',
      user_id: 'guest',
      name: 'James Anderson',
      email: 'james@example.com',
      birthday: '1986-07-15',
      description: 'Software engineer at Spotify. We bonded over our love of music and coding.',
      birthday_reminder: true,
      reminder_days: 35,
      last_conversation: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-12', contact_id: 'contact-8', platform: 'GitHub', url: 'https://github.com/james-anderson', created_at: new Date().toISOString() },
        { id: 'social-13', contact_id: 'contact-8', platform: 'LinkedIn', url: 'https://linkedin.com/in/james-anderson', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-9',
      user_id: 'guest',
      name: 'Lisa Wang',
      email: 'lisa@example.com',
      birthday: '1991-07-18',
      description: 'Marketing director at Nike. Met at the running club. Always has great insights on brand strategy.',
      birthday_reminder: true,
      reminder_days: 42,
      last_conversation: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-14', contact_id: 'contact-9', platform: 'LinkedIn', url: 'https://linkedin.com/in/lisa-wang', created_at: new Date().toISOString() },
        { id: 'social-15', contact_id: 'contact-9', platform: 'Twitter', url: 'https://twitter.com/lisa_marketing', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-10',
      user_id: 'guest',
      name: 'Robert Taylor',
      email: 'robert@example.com',
      birthday: '1984-07-22',
      description: 'Chef and restaurant owner. Makes the best pasta in town. Always experimenting with new recipes.',
      birthday_reminder: true,
      reminder_days: 56,
      last_conversation: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-16', contact_id: 'contact-10', platform: 'Instagram', url: 'https://instagram.com/chef.robert', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-11',
      user_id: 'guest',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      birthday: '1989-02-14',
      description: 'Veterinarian who takes care of my dog. Very caring and knowledgeable about animal health.',
      birthday_reminder: true,
      reminder_days: 180,
      last_conversation: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-17', contact_id: 'contact-11', platform: 'LinkedIn', url: 'https://linkedin.com/in/maria-garcia-dvm', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-12',
      user_id: 'guest',
      name: 'Alex Chen',
      email: 'alex@example.com',
      birthday: '1994-01-03',
      description: 'Photography enthusiast and travel blogger. Always has amazing stories from around the world.',
      birthday_reminder: true,
      reminder_days: 25,
      last_conversation: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-18', contact_id: 'contact-12', platform: 'Instagram', url: 'https://instagram.com/alex.wanderlust', created_at: new Date().toISOString() },
        { id: 'social-19', contact_id: 'contact-12', platform: 'YouTube', url: 'https://youtube.com/alex-travels', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-13',
      user_id: 'guest',
      name: 'Rachel Brown',
      email: 'rachel@example.com',
      birthday: '1990-12-25',
      description: 'Financial advisor who helped me plan my retirement. Very patient and explains complex concepts well.',
      birthday_reminder: true,
      reminder_days: 120,
      last_conversation: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-20', contact_id: 'contact-13', platform: 'LinkedIn', url: 'https://linkedin.com/in/rachel-brown-cfa', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-14',
      user_id: 'guest',
      name: 'Kevin O\'Brien',
      email: 'kevin@example.com',
      birthday: '1985-01-10',
      description: 'Musician and music teacher. Plays in a local band and gives guitar lessons.',
      birthday_reminder: true,
      reminder_days: 30,
      last_conversation: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-21', contact_id: 'contact-14', platform: 'Instagram', url: 'https://instagram.com/kevin.music', created_at: new Date().toISOString() },
        { id: 'social-22', contact_id: 'contact-14', platform: 'SoundCloud', url: 'https://soundcloud.com/kevin-obrien', created_at: new Date().toISOString() }
      ]
    },
    {
      id: 'contact-15',
      user_id: 'guest',
      name: 'Amanda Foster',
      email: 'amanda@example.com',
      birthday: '1992-01-28',
      description: 'Environmental scientist working on climate change research. Very passionate about sustainability.',
      birthday_reminder: true,
      reminder_days: 50,
      last_conversation: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      next_reminder: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      social_links: [
        { id: 'social-23', contact_id: 'contact-15', platform: 'LinkedIn', url: 'https://linkedin.com/in/amanda-foster', created_at: new Date().toISOString() },
        { id: 'social-24', contact_id: 'contact-15', platform: 'Twitter', url: 'https://twitter.com/amanda_climate', created_at: new Date().toISOString() }
      ]
    }
  ];

  static initializeGuestMode(): void {
    localStorage.set(this.GUEST_USER_KEY, this.GUEST_USER);
    localStorage.set(this.GUEST_CONTACTS_KEY, this.DUMMY_CONTACTS);
    localStorage.set(this.GUEST_CONVERSATIONS_KEY, {});
    
    // Set a cookie so middleware can detect guest mode
    if (typeof document !== 'undefined') {
      document.cookie = 'guest_user=true; path=/; SameSite=Lax';
    }
  }

  static getGuestUser(): User | null {
    return localStorage.get(this.GUEST_USER_KEY);
  }

  static getGuestContacts(): Contact[] {
    return localStorage.get(this.GUEST_CONTACTS_KEY) || [];
  }

  static updateGuestContact(contactId: string, updates: Partial<Contact>): Contact | null {
    const contacts = this.getGuestContacts();
    const index = contacts.findIndex(c => c.id === contactId);
    
    if (index === -1) return null;

    const updatedContact = {
      ...contacts[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    contacts[index] = updatedContact;
    localStorage.set(this.GUEST_CONTACTS_KEY, contacts);
    
    return updatedContact;
  }

  static addGuestContact(contact: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Contact {
    const contacts = this.getGuestContacts();
    const newContact: Contact = {
      ...contact,
      id: `guest-contact-${Date.now()}`,
      user_id: 'guest',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    contacts.push(newContact);
    localStorage.set(this.GUEST_CONTACTS_KEY, contacts);
    
    return newContact;
  }

  static deleteGuestContact(contactId: string): boolean {
    const contacts = this.getGuestContacts();
    const filteredContacts = contacts.filter(c => c.id !== contactId);
    
    if (filteredContacts.length === contacts.length) return false;

    localStorage.set(this.GUEST_CONTACTS_KEY, filteredContacts);
    return true;
  }

  static getGuestConversations(contactId: string): ConversationEntry[] {
    const conversations = localStorage.get<Record<string, ConversationEntry[]>>(this.GUEST_CONVERSATIONS_KEY) || {};
    return conversations[contactId] || [];
  }

  static addGuestConversation(contactId: string, content: string): ConversationEntry {
    const conversations = localStorage.get<Record<string, ConversationEntry[]>>(this.GUEST_CONVERSATIONS_KEY) || {};
    const contactConversations = conversations[contactId] || [];
    
    const newConversation: ConversationEntry = {
      id: `conversation-${Date.now()}`,
      contact_id: contactId,
      content,
      created_at: new Date().toISOString()
    };

    contactConversations.push(newConversation);
    conversations[contactId] = contactConversations;
    localStorage.set(this.GUEST_CONVERSATIONS_KEY, conversations);
    
    return newConversation;
  }

  static clearGuestData(): void {
    localStorage.remove(this.GUEST_USER_KEY);
    localStorage.remove(this.GUEST_CONTACTS_KEY);
    localStorage.remove(this.GUEST_CONVERSATIONS_KEY);
    
    // Clear the guest cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'guest_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  }

  static isGuestMode(): boolean {
    return this.getGuestUser() !== null;
  }

  static ensureGuestCookie(): void {
    // Ensure guest cookie is set if we're in guest mode
    if (this.isGuestMode() && typeof document !== 'undefined') {
      const cookieExists = document.cookie.includes('guest_user=true');
      if (!cookieExists) {
        document.cookie = 'guest_user=true; path=/; SameSite=Lax';
      }
    }
  }
}