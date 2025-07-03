import { GuestService } from '../GuestService'
import type { Contact, ConversationEntry } from '@/lib/types/entities'

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage.store[key]
  }),
  clear: jest.fn(() => {
    mockLocalStorage.store = {}
  })
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
})

describe('GuestService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    mockLocalStorage.store = {}
    document.cookie = ''
    jest.clearAllMocks()
  })

  describe('Guest User Management', () => {
    it('should initialize guest mode correctly', () => {
      GuestService.initializeGuestMode()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'guest_user',
        JSON.stringify(GuestService.GUEST_USER)
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'guest_contacts',
        JSON.stringify(GuestService.DUMMY_CONTACTS)
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'guest_conversations',
        JSON.stringify({})
      )
      expect(document.cookie).toContain('guest_user=true')
    })

    it('should return guest user when available', () => {
      mockLocalStorage.store['guest_user'] = JSON.stringify(GuestService.GUEST_USER)
      
      const user = GuestService.getGuestUser()
      
      expect(user).toEqual(GuestService.GUEST_USER)
    })

    it('should return null when no guest user exists', () => {
      const user = GuestService.getGuestUser()
      
      expect(user).toBeNull()
    })

    it('should detect guest mode correctly', () => {
      expect(GuestService.isGuestMode()).toBe(false)
      
      mockLocalStorage.store['guest_user'] = JSON.stringify(GuestService.GUEST_USER)
      
      expect(GuestService.isGuestMode()).toBe(true)
    })

    it('should clear guest data correctly', () => {
      GuestService.initializeGuestMode()
      
      GuestService.clearGuestData()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('guest_user')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('guest_contacts')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('guest_conversations')
      expect(document.cookie).toContain('guest_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT')
    })
  })

  describe('Guest Contacts Management', () => {
    beforeEach(() => {
      GuestService.initializeGuestMode()
    })

    it('should return guest contacts', () => {
      const contacts = GuestService.getGuestContacts()
      
      expect(contacts).toHaveLength(15) // Updated to match new dummy data count
      expect(contacts[0].name).toBe('Alice Johnson')
      expect(contacts[0].user_id).toBe('guest')
    })

    it('should return empty array when no contacts exist', () => {
      mockLocalStorage.store['guest_contacts'] = undefined
      
      const contacts = GuestService.getGuestContacts()
      
      expect(contacts).toEqual([])
    })

    it('should add a new guest contact', () => {
      const newContact = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1-555-9999',
        birthday: '1990-01-01',
        notes: 'Test notes',
        reminder_days: 30,
        last_conversation: new Date().toISOString(),
        next_reminder: new Date().toISOString(),
        social_links: []
      }

      const addedContact = GuestService.addGuestContact(newContact)
      
      expect(addedContact.name).toBe('Test User')
      expect(addedContact.id).toMatch(/^guest-contact-\d+$/)
      expect(addedContact.user_id).toBe('guest')
      expect(addedContact.created_at).toBeDefined()
      expect(addedContact.updated_at).toBeDefined()

      const contacts = GuestService.getGuestContacts()
      expect(contacts).toHaveLength(16) // 15 dummy + 1 new
    })

    it('should update an existing guest contact', () => {
      const contacts = GuestService.getGuestContacts()
      const originalContact = contacts[0]
      
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com'
      }

      const updatedContact = GuestService.updateGuestContact(originalContact.id, updates)
      
      expect(updatedContact).not.toBeNull()
      expect(updatedContact!.name).toBe('Updated Name')
      expect(updatedContact!.email).toBe('updated@example.com')
      expect(updatedContact!.id).toBe(originalContact.id)
      expect(new Date(updatedContact!.updated_at).getTime()).toBeGreaterThan(new Date(originalContact.updated_at).getTime())

      const refreshedContacts = GuestService.getGuestContacts()
      const foundContact = refreshedContacts.find(c => c.id === originalContact.id)
      expect(foundContact!.name).toBe('Updated Name')
    })

    it('should return null when updating non-existent contact', () => {
      const result = GuestService.updateGuestContact('non-existent-id', { name: 'Test' })
      
      expect(result).toBeNull()
    })

    it('should delete an existing guest contact', () => {
      const contacts = GuestService.getGuestContacts()
      const contactToDelete = contacts[0]
      
      const result = GuestService.deleteGuestContact(contactToDelete.id)
      
      expect(result).toBe(true)

      const remainingContacts = GuestService.getGuestContacts()
      expect(remainingContacts).toHaveLength(14) // 15 - 1
      expect(remainingContacts.find(c => c.id === contactToDelete.id)).toBeUndefined()
    })

    it('should return false when deleting non-existent contact', () => {
      const result = GuestService.deleteGuestContact('non-existent-id')
      
      expect(result).toBe(false)
    })
  })

  describe('Guest Conversations Management', () => {
    beforeEach(() => {
      GuestService.initializeGuestMode()
    })

    it('should return empty array for non-existent contact conversations', () => {
      const conversations = GuestService.getGuestConversations('non-existent-id')
      
      expect(conversations).toEqual([])
    })

    it('should add a conversation to a contact', () => {
      const contactId = 'contact-1'
      const content = 'Test conversation content'
      
      const conversation = GuestService.addGuestConversation(contactId, content)
      
      expect(conversation.contact_id).toBe(contactId)
      expect(conversation.content).toBe(content)
      expect(conversation.id).toMatch(/^conversation-\d+$/)
      expect(conversation.created_at).toBeDefined()

      const conversations = GuestService.getGuestConversations(contactId)
      expect(conversations).toHaveLength(1)
      expect(conversations[0]).toEqual(conversation)
    })

    it('should handle multiple conversations for the same contact', () => {
      const contactId = 'contact-1'
      
      const conv1 = GuestService.addGuestConversation(contactId, 'First conversation')
      const conv2 = GuestService.addGuestConversation(contactId, 'Second conversation')
      
      const conversations = GuestService.getGuestConversations(contactId)
      expect(conversations).toHaveLength(2)
      expect(conversations[0]).toEqual(conv1)
      expect(conversations[1]).toEqual(conv2)
    })

    it('should handle conversations for different contacts separately', () => {
      const contact1Id = 'contact-1'
      const contact2Id = 'contact-2'
      
      GuestService.addGuestConversation(contact1Id, 'Contact 1 conversation')
      GuestService.addGuestConversation(contact2Id, 'Contact 2 conversation')
      
      const conv1 = GuestService.getGuestConversations(contact1Id)
      const conv2 = GuestService.getGuestConversations(contact2Id)
      
      expect(conv1).toHaveLength(1)
      expect(conv2).toHaveLength(1)
      expect(conv1[0].content).toBe('Contact 1 conversation')
      expect(conv2[0].content).toBe('Contact 2 conversation')
    })
  })

  describe('Cookie Management', () => {
    it('should ensure guest cookie is set when in guest mode', () => {
      mockLocalStorage.store['guest_user'] = JSON.stringify(GuestService.GUEST_USER)
      document.cookie = ''
      
      GuestService.ensureGuestCookie()
      
      expect(document.cookie).toContain('guest_user=true')
    })

    it('should not set cookie when not in guest mode', () => {
      document.cookie = ''
      
      GuestService.ensureGuestCookie()
      
      expect(document.cookie).toBe('')
    })

    it('should not set cookie if already exists', () => {
      mockLocalStorage.store['guest_user'] = JSON.stringify(GuestService.GUEST_USER)
      document.cookie = 'guest_user=true; other=value'
      
      GuestService.ensureGuestCookie()
      
      // Cookie should remain unchanged
      expect(document.cookie).toBe('guest_user=true; other=value')
    })
  })

  describe('Dummy Data Quality', () => {
    it('should have diverse birthday distribution', () => {
      const contacts = GuestService.DUMMY_CONTACTS
      const birthdayMonths = contacts
        .filter(c => c.birthday)
        .map(c => new Date(c.birthday!).getMonth())
      
      // Should have birthdays in different months
      const uniqueMonths = new Set(birthdayMonths)
      expect(uniqueMonths.size).toBeGreaterThan(3)
    })

    it('should have varied reminder intervals', () => {
      const contacts = GuestService.DUMMY_CONTACTS
      const reminderDays = contacts.map(c => c.reminder_days)
      const uniqueIntervals = new Set(reminderDays)
      
      // Should have different reminder intervals
      expect(uniqueIntervals.size).toBeGreaterThan(5)
    })

    it('should have contacts with different overdue states', () => {
      const contacts = GuestService.DUMMY_CONTACTS
      const now = new Date()
      
      const overdueContacts = contacts.filter(c => {
        if (!c.next_reminder) return false
        return new Date(c.next_reminder) < now
      })

      const upcomingContacts = contacts.filter(c => {
        if (!c.next_reminder) return false
        return new Date(c.next_reminder) >= now
      })

      // Should have both overdue and upcoming contacts
      expect(overdueContacts.length).toBeGreaterThan(0)
      expect(upcomingContacts.length).toBeGreaterThan(0)
    })

    it('should have contacts with social links', () => {
      const contacts = GuestService.DUMMY_CONTACTS
      const contactsWithSocialLinks = contacts.filter(c => c.social_links && c.social_links.length > 0)
      
      expect(contactsWithSocialLinks.length).toBeGreaterThan(5)
    })

    it('should have realistic professional backgrounds', () => {
      const contacts = GuestService.DUMMY_CONTACTS
      const jobTitles = ['engineer', 'designer', 'manager', 'director', 'founder', 'chef', 'instructor', 'scientist', 'advisor', 'musician', 'agent']
      
      const hasRealisticJobs = contacts.some(c => 
        c.description && jobTitles.some(title => 
          c.description!.toLowerCase().includes(title)
        )
      )
      
      expect(hasRealisticJobs).toBe(true)
    })
  })
})