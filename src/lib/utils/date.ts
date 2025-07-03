export const formatDateSimple = (dateString: string | null): string => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString()
}

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Never'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString()
  } catch {
    return 'Invalid Date'
  }
}

export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

export const isOverdue = (nextReminder: string | null): boolean => {
  if (!nextReminder) return false
  return new Date(nextReminder) < new Date()
}

export const daysSince = (dateString: string | null): number => {
  if (!dateString) return 0
  const diff = Date.now() - new Date(dateString).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const daysUntil = (dateString: string | null): number => {
  if (!dateString) return 0
  const diff = new Date(dateString).getTime() - Date.now()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const getDaysUntil = (dateString: string | null | undefined): number => {
  if (!dateString) return 0
  try {
    const diff = new Date(dateString).getTime() - Date.now()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  } catch {
    return 0
  }
}

export const addDays = (date: string | Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const getMonthName = (monthNumber: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  if (monthNumber < 0 || monthNumber > 11) return 'Invalid Month'
  return months[monthNumber]
}

export const getRelativeTime = (dateString: string | null): string => {
  if (!dateString) return 'Never'
  
  const now = new Date()
  const date = new Date(dateString)
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

interface Contact {
  id: string
  name: string
  birthday?: string
  birthday_reminder: boolean
}

interface UpcomingBirthday {
  contact: Contact
  daysUntil: number
}

export const getUpcomingBirthdays = (contacts: Contact[], daysAhead: number = 30): UpcomingBirthday[] => {
  const today = new Date()
  const currentYear = today.getFullYear()
  
  return contacts
    .filter(contact => contact.birthday && contact.birthday_reminder)
    .map(contact => {
      const birthdayParts = contact.birthday!.split('-')
      const birthdayMonth = parseInt(birthdayParts[1]) - 1 // 0-indexed month
      const birthdayDay = parseInt(birthdayParts[2])
      
      // Create birthday for this year
      let nextBirthday = new Date(currentYear, birthdayMonth, birthdayDay)
      
      // If birthday already passed this year, use next year
      if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, birthdayMonth, birthdayDay)
      }
      
      const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        contact,
        daysUntil
      }
    })
    .filter(({ daysUntil }) => daysUntil <= daysAhead)
    .sort((a, b) => a.daysUntil - b.daysUntil)
}