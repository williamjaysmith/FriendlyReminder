import { 
  formatDateFormatted, 
  formatRelativeTime, 
  formatNumber, 
  formatCurrency, 
  formatPercentage, 
  formatName, 
  formatPhone, 
  truncateText, 
  capitalize, 
  titleCase, 
  createSlug, 
  formatFileSize, 
  formatDuration 
} from '../formatting'

describe('formatting utilities', () => {
  describe('formatting.date', () => {
    it('should format dates correctly', () => {
      const date = new Date('2023-01-15T10:30:00Z')
      
      expect(formatDateFormatted(date, 'short')).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
      expect(formatDateFormatted(date, 'medium')).toContain('Jan')
      expect(formatDateFormatted(date, 'iso')).toBe('2023-01-15')
    })

    it('should handle date-only strings', () => {
      const dateString = '2023-01-15'
      const result = formatDateFormatted(dateString)
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
    })

    it('should handle null/undefined dates', () => {
      expect(formatDateFormatted(null)).toBe('Never')
      expect(formatDateFormatted(undefined)).toBe('Never')
    })

    it('should handle invalid dates', () => {
      expect(formatDateFormatted('invalid-date')).toBe('Invalid Date')
    })
  })

  describe('formatting.relativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-01-15T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should format relative time correctly', () => {
      expect(formatRelativeTime(new Date('2023-01-15T12:00:00Z'))).toBe('Today')
      expect(formatRelativeTime(new Date('2023-01-14T12:00:00Z'))).toBe('Yesterday')
      expect(formatRelativeTime(new Date('2023-01-16T12:00:00Z'))).toBe('Tomorrow')
      expect(formatRelativeTime(new Date('2023-01-13T12:00:00Z'))).toBe('2 days ago')
      expect(formatRelativeTime(new Date('2023-01-17T12:00:00Z'))).toBe('In 2 days')
    })

    it('should handle null/undefined dates', () => {
      expect(formatRelativeTime(null)).toBe('Never')
      expect(formatRelativeTime(undefined)).toBe('Never')
    })

    it('should handle invalid dates', () => {
      expect(formatRelativeTime('invalid-date')).toBe('Invalid Date')
    })
  })

  describe('formatting.number', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(1234.567)).toBe('1,234.567')
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(0)).toBe('0')
    })

    it('should handle formatting options', () => {
      expect(formatNumber(1234.567, { maximumFractionDigits: 2 })).toBe('1,234.57')
      expect(formatNumber(1234.567, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe('1,234.57')
    })
  })

  describe('formatting.currency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toMatch(/\$1,234\.56/)
      expect(formatCurrency(1234.56, 'EUR')).toMatch(/€1,234\.56/)
    })

    it('should handle zero and negative values', () => {
      expect(formatCurrency(0)).toMatch(/\$0\.00/)
      expect(formatCurrency(-123.45)).toMatch(/-\$123\.45/)
    })
  })

  describe('formatting.percentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(50)).toBe('50.0%')
      expect(formatPercentage(75.5)).toBe('75.5%')
      expect(formatPercentage(100)).toBe('100.0%')
    })

    it('should handle decimal places', () => {
      expect(formatPercentage(50, 0)).toBe('50%')
      expect(formatPercentage(75.555, 2)).toBe('75.56%')
    })
  })

  describe('formatting.name', () => {
    it('should format names correctly', () => {
      expect(formatName('John', 'Doe')).toBe('John Doe')
      expect(formatName('John', 'Doe', 'first')).toBe('John')
      expect(formatName('John', 'Doe', 'last')).toBe('Doe')
      expect(formatName('John', 'Doe', 'initials')).toBe('JD')
    })

    it('should handle missing names', () => {
      expect(formatName('John', '', 'full')).toBe('John')
      expect(formatName('', 'Doe', 'full')).toBe('Doe')
      expect(formatName('', '', 'full')).toBe('')
    })

    it('should handle whitespace', () => {
      expect(formatName('  John  ', '  Doe  ')).toBe('John Doe')
      expect(formatName('John', undefined, 'initials')).toBe('J')
    })
  })

  describe('formatting.phone', () => {
    it('should format US phone numbers', () => {
      expect(formatPhone('5551234567')).toBe('(555) 123-4567')
      expect(formatPhone('15551234567')).toBe('+1 (555) 123-4567')
    })

    it('should handle already formatted numbers', () => {
      expect(formatPhone('(555) 123-4567')).toBe('(555) 123-4567')
      expect(formatPhone('555-123-4567')).toBe('(555) 123-4567')
    })

    it('should handle invalid phone numbers', () => {
      expect(formatPhone('123')).toBe('123')
      expect(formatPhone('abc-def-ghij')).toBe('abc-def-ghij')
    })
  })

  describe('formatting.truncate', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a...')
      expect(truncateText('This is a long text', 10, '***')).toBe('This is a***')
    })

    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short')
    })

    it('should handle exact length', () => {
      expect(truncateText('Exactly10!', 10)).toBe('Exactly10!')
    })
  })

  describe('formatting.capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('HELLO')).toBe('Hello')
      expect(capitalize('hELLO')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A')
      expect(capitalize('A')).toBe('A')
    })
  })

  describe('formatting.titleCase', () => {
    it('should convert to title case', () => {
      expect(titleCase('hello world')).toBe('Hello World')
      expect(titleCase('HELLO WORLD')).toBe('Hello World')
      expect(titleCase('hELLO wORLD')).toBe('Hello World')
    })

    it('should handle hyphenated words', () => {
      expect(titleCase('hello-world')).toBe('Hello-world')
    })

    it('should handle empty string', () => {
      expect(titleCase('')).toBe('')
    })
  })

  describe('formatting.slug', () => {
    it('should create valid slugs', () => {
      expect(createSlug('Hello World')).toBe('hello-world')
      expect(createSlug('Hello, World!')).toBe('hello-world')
      expect(createSlug('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('should handle special characters', () => {
      expect(createSlug('Hello & World @ 2023')).toBe('hello-world-2023')
      expect(createSlug('Test_File-Name.txt')).toBe('test-file-nametxt')
    })

    it('should handle leading/trailing hyphens', () => {
      expect(createSlug('  Hello World  ')).toBe('hello-world')
      expect(createSlug('---Hello---World---')).toBe('hello-world')
    })
  })

  describe('formatting.fileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB')
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1.0 TB')
    })

    it('should handle bytes', () => {
      expect(formatFileSize(512)).toBe('512 B')
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('should handle large sizes', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB')
    })
  })

  describe('formatting.duration', () => {
    it('should format durations correctly', () => {
      expect(formatDuration(30)).toBe('30s')
      expect(formatDuration(90)).toBe('1m 30s')
      expect(formatDuration(3661)).toBe('1h 1m 1s')
      expect(formatDuration(7200)).toBe('2h 0m 0s')
    })

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0s')
    })

    it('should handle minutes only', () => {
      expect(formatDuration(120)).toBe('2m 0s')
    })
  })
})