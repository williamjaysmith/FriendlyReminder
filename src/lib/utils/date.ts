export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString()
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