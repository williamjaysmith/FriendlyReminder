// Contact service for database operations
import { Contact, ContactFormData, ContactUpdate } from '@/lib/types'
import { ApiResponse, PaginatedResponse, QueryParams } from '@/lib/types'
import { createError, errorHandler } from '@/lib/utils'

export class ContactService {
  // Get all contacts for a user
  static async getContacts(
    userId: string,
    params?: QueryParams
  ): Promise<ApiResponse<Contact[]>> {
    try {
      // This would integrate with your actual database/API
      // For now, returning mock data structure
      const contacts: Contact[] = []
      
      return {
        data: contacts,
        success: true
      }
    } catch (error) {
      errorHandler.log(error, { action: 'getContacts', userId })
      throw createError.generic('Failed to fetch contacts')
    }
  }

  // Get paginated contacts
  static async getPaginatedContacts(
    userId: string,
    params: QueryParams = {}
  ): Promise<PaginatedResponse<Contact>> {
    try {
      const { page = 1, limit = 10, search, sort, filter } = params
      
      // This would integrate with your actual database/API
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    } catch (error) {
      errorHandler.log(error, { action: 'getPaginatedContacts', userId })
      throw createError.generic('Failed to fetch contacts')
    }
  }

  // Get a single contact by ID
  static async getContact(
    contactId: string,
    userId: string
  ): Promise<ApiResponse<Contact>> {
    try {
      // This would integrate with your actual database/API
      const contact: Contact | null = null
      
      if (!contact) {
        throw createError.notFound('Contact')
      }

      return {
        data: contact,
        success: true
      }
    } catch (error) {
      errorHandler.log(error, { action: 'getContact', contactId, userId })
      throw error
    }
  }

  // Create a new contact
  static async createContact(
    userId: string,
    data: ContactFormData
  ): Promise<ApiResponse<Contact>> {
    try {
      // Validate the data
      const validationErrors = this.validateContactData(data)
      if (Object.keys(validationErrors).length > 0) {
        throw createError.validation('Invalid contact data', validationErrors)
      }

      // This would integrate with your actual database/API
      const contact: Contact = {
        id: 'new-id',
        user_id: userId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return {
        data: contact,
        success: true,
        message: 'Contact created successfully'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'createContact', userId })
      throw error
    }
  }

  // Update an existing contact
  static async updateContact(
    contactId: string,
    userId: string,
    data: ContactUpdate
  ): Promise<ApiResponse<Contact>> {
    try {
      // Check if contact exists and belongs to user
      const existingContact = await this.getContact(contactId, userId)
      if (!existingContact.data) {
        throw createError.notFound('Contact')
      }

      // Validate the update data
      const validationErrors = this.validateContactUpdateData(data)
      if (Object.keys(validationErrors).length > 0) {
        throw createError.validation('Invalid contact data', validationErrors)
      }

      // This would integrate with your actual database/API
      const updatedContact: Contact = {
        ...existingContact.data,
        ...data,
        updated_at: new Date().toISOString()
      }

      return {
        data: updatedContact,
        success: true,
        message: 'Contact updated successfully'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'updateContact', contactId, userId })
      throw error
    }
  }

  // Delete a contact
  static async deleteContact(
    contactId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      // Check if contact exists and belongs to user
      const existingContact = await this.getContact(contactId, userId)
      if (!existingContact.data) {
        throw createError.notFound('Contact')
      }

      // This would integrate with your actual database/API
      // Delete the contact

      return {
        data: undefined,
        success: true,
        message: 'Contact deleted successfully'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'deleteContact', contactId, userId })
      throw error
    }
  }

  // Search contacts
  static async searchContacts(
    userId: string,
    query: string,
    params?: QueryParams
  ): Promise<ApiResponse<Contact[]>> {
    try {
      if (!query.trim()) {
        return {
          data: [],
          success: true
        }
      }

      // This would integrate with your actual database/API search
      const contacts: Contact[] = []

      return {
        data: contacts,
        success: true
      }
    } catch (error) {
      errorHandler.log(error, { action: 'searchContacts', userId, query })
      throw createError.generic('Failed to search contacts')
    }
  }

  // Update last conversation date
  static async updateLastConversation(
    contactId: string,
    userId: string,
    date: string = new Date().toISOString()
  ): Promise<ApiResponse<Contact>> {
    try {
      const updateData: ContactUpdate = {
        last_conversation: date,
        // Recalculate next_reminder based on reminder_days
        next_reminder: this.calculateNextReminder(date, 30) // Default 30 days
      }

      return await this.updateContact(contactId, userId, updateData)
    } catch (error) {
      errorHandler.log(error, { action: 'updateLastConversation', contactId, userId })
      throw error
    }
  }

  // Get contacts due for reminders
  static async getContactsDueForReminder(
    userId: string
  ): Promise<ApiResponse<Contact[]>> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // This would integrate with your actual database/API
      // Query for contacts where next_reminder <= today
      const contacts: Contact[] = []

      return {
        data: contacts,
        success: true
      }
    } catch (error) {
      errorHandler.log(error, { action: 'getContactsDueForReminder', userId })
      throw createError.generic('Failed to fetch reminder contacts')
    }
  }

  // Get contacts with upcoming birthdays
  static async getUpcomingBirthdays(
    userId: string,
    daysAhead: number = 7
  ): Promise<ApiResponse<Contact[]>> {
    try {
      // This would integrate with your actual database/API
      // Query for contacts with birthdays in the next N days
      const contacts: Contact[] = []

      return {
        data: contacts,
        success: true
      }
    } catch (error) {
      errorHandler.log(error, { action: 'getUpcomingBirthdays', userId })
      throw createError.generic('Failed to fetch upcoming birthdays')
    }
  }

  // Validate contact data
  private static validateContactData(data: ContactFormData): Record<string, string> {
    const errors: Record<string, string> = {}

    if (!data.name?.trim()) {
      errors.name = 'Name is required'
    }

    if (data.email && !this.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!data.reminder_days || data.reminder_days < 1) {
      errors.reminder_days = 'Reminder days must be a positive number'
    }

    return errors
  }

  // Validate contact update data
  private static validateContactUpdateData(data: ContactUpdate): Record<string, string> {
    const errors: Record<string, string> = {}

    if (data.name !== undefined && !data.name?.trim()) {
      errors.name = 'Name cannot be empty'
    }

    if (data.email !== undefined && data.email && !this.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (data.reminder_days !== undefined && (!data.reminder_days || data.reminder_days < 1)) {
      errors.reminder_days = 'Reminder days must be a positive number'
    }

    return errors
  }

  // Email validation helper
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Calculate next reminder date
  private static calculateNextReminder(lastConversation: string, reminderDays: number): string {
    const lastDate = new Date(lastConversation)
    const nextDate = new Date(lastDate)
    nextDate.setDate(nextDate.getDate() + reminderDays)
    return nextDate.toISOString()
  }
}

export default ContactService