import { 
  formatDate, 
  formatDateTime, 
  formatDateForInput, 
  getDaysUntil, 
  addDays, 
  getMonthName,
  getUpcomingBirthdays,
  isOverdue 
} from '../date'

describe('Date Utils', () => {
  beforeEach(() => {
    // Set consistent timezone for tests
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-07-15T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-01-15')
      expect(result).toMatch(/1\/1[45]\/2024/)
    })

    it('should handle ISO date strings', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toMatch(/1\/1[45]\/2024/)
    })

    it('should return "Never" for null/undefined', () => {
      expect(formatDate(null)).toBe('Never')
      expect(formatDate(undefined)).toBe('Never')
      expect(formatDate('')).toBe('Never')
    })

    it('should handle invalid dates gracefully', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z')
      expect(result).toMatch(/1\/1[45]\/2024.*[0-9]+:[0-9]+:[0-9]+ [AP]M/)
    })

    it('should return "Never" for null/undefined', () => {
      expect(formatDateTime(null)).toBe('Never')
      expect(formatDateTime(undefined)).toBe('Never')
    })

    it('should handle date-only strings', () => {
      const result = formatDateTime('2024-01-15')
      expect(result).toMatch(/1\/1[45]\/2024/)
    })
  })

  describe('formatDateForInput', () => {
    it('should format date for HTML input', () => {
      const result = formatDateForInput('2024-01-15T10:30:00Z')
      expect(result).toBe('2024-01-15')
    })

    it('should handle date-only strings', () => {
      const result = formatDateForInput('2024-01-15')
      expect(result).toBe('2024-01-15')
    })

    it('should return empty string for invalid input', () => {
      expect(formatDateForInput(null)).toBe('')
      expect(formatDateForInput(undefined)).toBe('')
      expect(formatDateForInput('')).toBe('')
    })
  })

  describe('getDaysUntil', () => {
    it('should calculate days until future date', () => {
      const futureDate = '2024-07-20' // 5 days from 2024-07-15
      const result = getDaysUntil(futureDate)
      expect(result).toBeGreaterThanOrEqual(4)
      expect(result).toBeLessThanOrEqual(5)
    })

    it('should return negative days for past dates', () => {
      const pastDate = '2024-07-10' // 5 days before 2024-07-15
      const result = getDaysUntil(pastDate)
      expect(result).toBeLessThanOrEqual(-4)
      expect(result).toBeGreaterThanOrEqual(-6)
    })

    it('should return 0 for same day', () => {
      const today = '2024-07-15'
      const result = getDaysUntil(today)
      expect(result).toBeGreaterThanOrEqual(-1)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('should handle ISO date strings', () => {
      const futureDate = '2024-07-20T14:30:00Z'
      const result = getDaysUntil(futureDate)
      expect(result).toBe(5)
    })
  })

  describe('addDays', () => {
    it('should add days to a date', () => {
      const baseDate = '2024-07-15'
      const result = addDays(baseDate, 5)
      expect(result.toISOString().split('T')[0]).toBe('2024-07-20')
    })

    it('should subtract days with negative input', () => {
      const baseDate = '2024-07-15'
      const result = addDays(baseDate, -5)
      expect(result.toISOString().split('T')[0]).toBe('2024-07-10')
    })

    it('should handle Date objects', () => {
      const baseDate = new Date('2024-07-15')
      const result = addDays(baseDate, 10)
      expect(result.toISOString().split('T')[0]).toBe('2024-07-25')
    })
  })

  describe('getMonthName', () => {
    it('should return correct month names', () => {
      expect(getMonthName(0)).toBe('January')
      expect(getMonthName(5)).toBe('June')
      expect(getMonthName(11)).toBe('December')
    })

    it('should handle invalid month numbers gracefully', () => {
      expect(getMonthName(-1)).toBe('Invalid Month')
      expect(getMonthName(12)).toBe('Invalid Month')
      expect(getMonthName(999)).toBe('Invalid Month')
    })
  })

  describe('isOverdue', () => {
    it('should detect overdue dates', () => {
      const pastDate = '2024-07-10' // 5 days ago from 2024-07-15
      expect(isOverdue(pastDate)).toBe(true)
    })

    it('should detect non-overdue dates', () => {
      const futureDate = '2024-07-20' // 5 days from now
      expect(isOverdue(futureDate)).toBe(false)
    })

    it('should handle today as not overdue', () => {
      const today = '2024-07-15T23:59:59Z'
      expect(isOverdue(today)).toBe(false)
    })

    it('should return false for null/undefined dates', () => {
      expect(isOverdue(null)).toBe(false)
      expect(isOverdue(undefined)).toBe(false)
      expect(isOverdue('')).toBe(false)
    })

    it('should handle ISO date strings', () => {
      const pastDate = '2024-07-10T10:30:00Z'
      expect(isOverdue(pastDate)).toBe(true)
    })
  })

  describe('getUpcomingBirthdays', () => {
    const mockContacts = [
      {
        id: '1',
        name: 'Alice',
        birthday: '1990-07-16', // Tomorrow
        birthday_reminder: true
      },
      {
        id: '2',
        name: 'Bob',
        birthday: '1985-07-25', // In 10 days
        birthday_reminder: true
      },
      {
        id: '3',
        name: 'Charlie',
        birthday: '1992-07-10', // 5 days ago
        birthday_reminder: true
      },
      {
        id: '4',
        name: 'Diana',
        birthday: '1988-08-15', // In 31 days
        birthday_reminder: true
      },
      {
        id: '5',
        name: 'Eve',
        birthday: '1995-07-20', // In 5 days
        birthday_reminder: false // Disabled
      },
      {
        id: '6',
        name: 'Frank',
        birthday: undefined, // No birthday
        birthday_reminder: true
      }
    ] as any[]

    it('should return upcoming birthdays within 30 days', () => {
      const result = getUpcomingBirthdays(mockContacts)
      
      expect(result).toHaveLength(2) // Alice and Bob
      expect(result.map(r => r.contact.name)).toEqual(['Alice', 'Bob'])
    })

    it('should calculate correct days until birthday', () => {
      const result = getUpcomingBirthdays(mockContacts)
      
      const alice = result.find(r => r.contact.name === 'Alice')
      const bob = result.find(r => r.contact.name === 'Bob')
      
      expect(alice?.daysUntil).toBe(1)
      expect(bob?.daysUntil).toBe(10)
    })

    it('should respect birthday_reminder flag', () => {
      const result = getUpcomingBirthdays(mockContacts)
      
      // Eve should not be included because birthday_reminder is false
      expect(result.find(r => r.contact.name === 'Eve')).toBeUndefined()
    })

    it('should exclude contacts without birthdays', () => {
      const result = getUpcomingBirthdays(mockContacts)
      
      // Frank should not be included because no birthday
      expect(result.find(r => r.contact.name === 'Frank')).toBeUndefined()
    })

    it('should handle custom days threshold', () => {
      const result = getUpcomingBirthdays(mockContacts, 5)
      
      expect(result).toHaveLength(1) // Only Alice within 5 days
      expect(result[0].contact.name).toBe('Alice')
    })

    it('should handle empty contact list', () => {
      const result = getUpcomingBirthdays([])
      expect(result).toEqual([])
    })

    it('should handle next year birthdays correctly', () => {
      // Test with a birthday that already passed this year
      const pastBirthdayContacts = [
        {
          id: '1',
          name: 'John',
          birthday: '1990-01-15', // Already passed this year
          birthday_reminder: true
        }
      ] as any[]

      const result = getUpcomingBirthdays(pastBirthdayContacts, 365)
      
      // Should calculate days until next year's birthday
      expect(result).toHaveLength(1)
      expect(result[0].daysUntil).toBeGreaterThan(150) // Should be next year
    })
  })

  describe('Edge Cases', () => {
    it('should handle leap year dates', () => {
      jest.setSystemTime(new Date('2024-02-28T12:00:00Z')) // 2024 is a leap year
      
      const leapDayResult = getDaysUntil('2024-02-29')
      expect(leapDayResult).toBeGreaterThanOrEqual(0)
      expect(leapDayResult).toBeLessThanOrEqual(2)
    })

    it('should handle timezone differences gracefully', () => {
      const utcDate = '2024-07-15T23:59:59Z'
      const result = formatDate(utcDate)
      expect(result).toMatch(/7\/15\/2024|7\/16\/2024/) // Could be either depending on timezone
    })

    it('should handle very large date differences', () => {
      const futureDate = '2030-07-15'
      const result = getDaysUntil(futureDate)
      expect(result).toBeGreaterThan(2000) // Should be roughly 6 years
    })
  })
})