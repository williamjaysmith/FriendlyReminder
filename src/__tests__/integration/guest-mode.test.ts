import { GuestService } from '@/lib/services/GuestService'

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

describe('Guest Mode Integration Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    mockLocalStorage.store = {}
    document.cookie = ''
    jest.clearAllMocks()
  })

  describe('Complete Guest Workflow', () => {
    it('should handle complete guest user journey', () => {
      // 1. Initialize guest mode (simulates user clicking "Try as Guest")
      GuestService.initializeGuestMode()
      
      // 2. Verify initialization
      expect(GuestService.isGuestMode()).toBe(true)
      expect(GuestService.getGuestUser()).toEqual(GuestService.GUEST_USER)
      expect(document.cookie).toContain('guest_user=true')
      
      // 3. Get initial contacts (should have 15 dummy contacts)
      const initialContacts = GuestService.getGuestContacts()
      expect(initialContacts).toHaveLength(15)
      
      // 4. Add a new contact
      const newContact = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1-555-9999',
        birthday: '1990-01-01',
        notes: 'Test contact for integration test',
        reminder_days: 30,
        last_conversation: new Date().toISOString(),
        next_reminder: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        social_links: [
          { platform: 'LinkedIn', url: 'https://linkedin.com/in/test-user' }
        ]
      }
      
      const addedContact = GuestService.addGuestContact(newContact)
      expect(addedContact.name).toBe('Test User')
      expect(addedContact.id).toMatch(/^guest-contact-\d+$/)
      
      // 5. Verify contact was added
      const contactsAfterAdd = GuestService.getGuestContacts()
      expect(contactsAfterAdd).toHaveLength(16)
      
      // 6. Update the contact
      const updates = {
        name: 'Updated Test User',
        email: 'updated@example.com',
        notes: 'Updated notes'
      }
      
      const updatedContact = GuestService.updateGuestContact(addedContact.id, updates)
      expect(updatedContact?.name).toBe('Updated Test User')
      expect(updatedContact?.email).toBe('updated@example.com')
      
      // 7. Add conversation
      const conversation = GuestService.addGuestConversation(
        addedContact.id, 
        'Had a great conversation about the project'
      )
      expect(conversation.contact_id).toBe(addedContact.id)
      expect(conversation.content).toBe('Had a great conversation about the project')
      
      // 8. Get conversations
      const conversations = GuestService.getGuestConversations(addedContact.id)
      expect(conversations).toHaveLength(1)
      expect(conversations[0]).toEqual(conversation)
      
      // 9. Delete the contact
      const deleteResult = GuestService.deleteGuestContact(addedContact.id)
      expect(deleteResult).toBe(true)
      
      // 10. Verify contact was deleted
      const contactsAfterDelete = GuestService.getGuestContacts()
      expect(contactsAfterDelete).toHaveLength(15) // Back to original
      expect(contactsAfterDelete.find(c => c.id === addedContact.id)).toBeUndefined()
      
      // 11. Clear guest data (simulates user signing up or logging out)
      GuestService.clearGuestData()
      
      // 12. Verify cleanup
      expect(GuestService.isGuestMode()).toBe(false)
      expect(GuestService.getGuestUser()).toBeNull()
      expect(GuestService.getGuestContacts()).toEqual([])
      expect(document.cookie).toContain('guest_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT')
    })
  })

  describe('Data Persistence', () => {
    it('should persist data across service calls', () => {
      // Initialize and add data
      GuestService.initializeGuestMode()
      
      const newContact = {
        name: 'Persistent User',
        email: 'persist@example.com',
        notes: 'This should persist',
        reminder_days: 60,
        last_conversation: new Date().toISOString(),
        next_reminder: new Date().toISOString(),
        social_links: []
      }
      
      const addedContact = GuestService.addGuestContact(newContact)
      GuestService.addGuestConversation(addedContact.id, 'First conversation')
      GuestService.addGuestConversation(addedContact.id, 'Second conversation')
      
      // Simulate page refresh by creating new service instance calls
      const persistedContacts = GuestService.getGuestContacts()
      const persistedUser = GuestService.getGuestUser()
      const persistedConversations = GuestService.getGuestConversations(addedContact.id)
      
      // Verify data persisted
      expect(persistedUser).toEqual(GuestService.GUEST_USER)
      expect(persistedContacts.find(c => c.id === addedContact.id)).toBeDefined()
      expect(persistedConversations).toHaveLength(2)
      expect(persistedConversations[0].content).toBe('First conversation')
      expect(persistedConversations[1].content).toBe('Second conversation')
    })

    it('should handle data corruption gracefully', () => {
      // Initialize guest mode
      GuestService.initializeGuestMode()
      
      // Corrupt the contacts data
      mockLocalStorage.store['guest_contacts'] = 'invalid json'
      
      // Should return empty array for corrupted data
      const contacts = GuestService.getGuestContacts()
      expect(contacts).toEqual([])
      
      // Should still be able to add new contacts
      const newContact = {
        name: 'Recovery Test',
        email: 'recovery@example.com',
        notes: 'Testing recovery',
        reminder_days: 30,
        last_conversation: new Date().toISOString(),
        next_reminder: new Date().toISOString(),
        social_links: []
      }
      
      expect(() => GuestService.addGuestContact(newContact)).not.toThrow()
    })
  })

  describe('Cookie Management', () => {
    it('should handle cookie edge cases', () => {
      // Start without guest mode
      expect(GuestService.isGuestMode()).toBe(false)
      
      // Ensure cookie is not set when not in guest mode
      GuestService.ensureGuestCookie()
      expect(document.cookie).toBe('')
      
      // Initialize guest mode
      GuestService.initializeGuestMode()
      expect(document.cookie).toContain('guest_user=true')
      
      // Clear the cookie but keep localStorage
      document.cookie = ''
      
      // Ensure cookie should restore it
      GuestService.ensureGuestCookie()
      expect(document.cookie).toContain('guest_user=true')
      
      // Test with existing cookie
      document.cookie = 'guest_user=true; other=value'
      GuestService.ensureGuestCookie()
      // Should not duplicate
      expect(document.cookie).toBe('guest_user=true; other=value')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle operations on non-existent contacts', () => {
      GuestService.initializeGuestMode()
      
      // Try to update non-existent contact
      const updateResult = GuestService.updateGuestContact('non-existent', { name: 'Test' })
      expect(updateResult).toBeNull()
      
      // Try to delete non-existent contact
      const deleteResult = GuestService.deleteGuestContact('non-existent')
      expect(deleteResult).toBe(false)
      
      // Try to get conversations for non-existent contact
      const conversations = GuestService.getGuestConversations('non-existent')
      expect(conversations).toEqual([])
    })

    it('should handle empty and invalid inputs', () => {
      GuestService.initializeGuestMode()
      
      // Add contact with minimal data
      const minimalContact = {
        name: 'Minimal',
        reminder_days: 30,
        last_conversation: new Date().toISOString(),
        next_reminder: new Date().toISOString(),
        social_links: []
      }
      
      const addedContact = GuestService.addGuestContact(minimalContact)
      expect(addedContact.name).toBe('Minimal')
      expect(addedContact.email).toBeUndefined()
      
      // Add empty conversation
      const emptyConversation = GuestService.addGuestConversation(addedContact.id, '')
      expect(emptyConversation.content).toBe('')
      
      // Update with empty values
      const updateResult = GuestService.updateGuestContact(addedContact.id, {
        email: '',
        notes: undefined
      })
      expect(updateResult?.email).toBe('')
      expect(updateResult?.notes).toBeUndefined()
    })
  })

  describe('Data Quality and Consistency', () => {
    it('should maintain data consistency across operations', () => {
      GuestService.initializeGuestMode()
      
      const contact = GuestService.addGuestContact({
        name: 'Consistency Test',
        email: 'consistency@example.com',
        reminder_days: 30,
        last_conversation: new Date().toISOString(),
        next_reminder: new Date().toISOString(),
        social_links: []
      })
      
      // Verify timestamps are set correctly
      expect(contact.created_at).toBeDefined()
      expect(contact.updated_at).toBeDefined()
      expect(contact.user_id).toBe('guest')
      
      const originalUpdatedAt = contact.updated_at
      
      // Wait a bit and update
      setTimeout(() => {
        const updatedContact = GuestService.updateGuestContact(contact.id, {
          name: 'Updated Name'
        })
        
        expect(updatedContact?.updated_at).toBeDefined()
        expect(new Date(updatedContact!.updated_at).getTime())
          .toBeGreaterThan(new Date(originalUpdatedAt).getTime())
      }, 10)
    })

    it('should validate dummy data quality', () => {
      const dummyContacts = GuestService.DUMMY_CONTACTS
      
      // All contacts should have required fields
      dummyContacts.forEach(contact => {
        expect(contact.id).toBeDefined()
        expect(contact.name).toBeDefined()
        expect(contact.user_id).toBe('guest')
        expect(contact.reminder_days).toBeGreaterThan(0)
        expect(contact.last_conversation).toBeDefined()
        expect(contact.next_reminder).toBeDefined()
        expect(contact.created_at).toBeDefined()
        expect(contact.updated_at).toBeDefined()
        expect(Array.isArray(contact.social_links)).toBe(true)
      })
      
      // Should have varied data
      const names = dummyContacts.map(c => c.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length) // All names should be unique
      
      // Should have some contacts with birthdays
      const contactsWithBirthdays = dummyContacts.filter(c => c.birthday)
      expect(contactsWithBirthdays.length).toBeGreaterThan(5)
      
      // Should have varied reminder intervals
      const reminderIntervals = dummyContacts.map(c => c.reminder_days)
      const uniqueIntervals = new Set(reminderIntervals)
      expect(uniqueIntervals.size).toBeGreaterThan(3)
    })
  })

  describe('Performance and Memory', () => {
    it('should handle large number of operations efficiently', () => {
      GuestService.initializeGuestMode()
      
      const startTime = Date.now()
      const contactIds: string[] = []
      
      // Add 100 contacts
      for (let i = 0; i < 100; i++) {
        const contact = GuestService.addGuestContact({
          name: `Performance Test ${i}`,
          email: `perf${i}@example.com`,
          reminder_days: 30,
          last_conversation: new Date().toISOString(),
          next_reminder: new Date().toISOString(),
          social_links: []
        })
        contactIds.push(contact.id)
      }
      
      // Add conversations to each
      contactIds.forEach((id, index) => {
        for (let j = 0; j < 5; j++) {
          GuestService.addGuestConversation(id, `Conversation ${j} for contact ${index}`)
        }
      })
      
      // Update all contacts
      contactIds.forEach((id, index) => {
        GuestService.updateGuestContact(id, {
          name: `Updated Performance Test ${index}`
        })
      })
      
      // Get all data
      const allContacts = GuestService.getGuestContacts()
      expect(allContacts.length).toBe(115) // 15 dummy + 100 new
      
      // Operations should complete in reasonable time (less than 1 second)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000)
      
      // Clean up
      contactIds.forEach(id => {
        GuestService.deleteGuestContact(id)
      })
      
      expect(GuestService.getGuestContacts().length).toBe(15) // Back to dummy data
    })
  })
})