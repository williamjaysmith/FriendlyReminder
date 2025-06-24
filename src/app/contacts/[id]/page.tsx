'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { databases } from '@/lib/appwrite/client'
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/types'
import { mapDocumentToContact } from '@/lib/appwrite/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppLayout } from '@/components/layout/app-layout'
import { Contact } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ContactDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const contactId = params.id as string
  const [contact, setContact] = useState<Contact | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    birthday: '',
    description: '',
    work_company: '',
    work_position: '',
    how_we_met: '',
    interests: '',
    reminder_days: 30,
    email_reminders: false,
    birthday_reminder: false
  })

  const fetchContact = useCallback(async () => {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.CONTACTS,
        contactId
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contactData = mapDocumentToContact(response as any)

      // Check if this contact belongs to the current user
      if (contactData.user_id !== user?.$id) {
        throw new Error('Contact not found')
      }

      setContact(contactData)
      setFormData({
        name: contactData.name || '',
        email: contactData.email || '',
        gender: contactData.gender || '',
        birthday: contactData.birthday || '',
        description: contactData.description || '',
        work_company: contactData.work_company || '',
        work_position: contactData.work_position || '',
        how_we_met: contactData.how_we_met || '',
        interests: contactData.interests || '',
        reminder_days: contactData.reminder_days || 30,
        email_reminders: contactData.email_reminders || false,
        birthday_reminder: contactData.birthday_reminder || false
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [contactId, user?.$id])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchContact()
  }, [user, contactId, fetchContact, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const updateData = {
        name: formData.name,
        email: formData.email || undefined,
        gender: formData.gender || undefined,
        birthday: formData.birthday || undefined,
        description: formData.description || undefined,
        work_company: formData.work_company || undefined,
        work_position: formData.work_position || undefined,
        how_we_met: formData.how_we_met || undefined,
        interests: formData.interests || undefined,
        reminder_days: formData.reminder_days,
        email_reminders: formData.email_reminders,
        birthday_reminder: formData.birthday_reminder
      }

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CONTACTS,
        contactId,
        updateData
      )

      await fetchContact()
      setIsEditing(false)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleJustTalked = async () => {
    setSaving(true)
    setError(null)

    try {
      const now = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      const nextReminder = new Date(Date.now() + (contact?.reminder_days || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CONTACTS,
        contactId,
        {
          last_conversation: now,
          next_reminder: nextReminder
        }
      )

      await fetchContact()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.CONTACTS,
        contactId
      )

      router.push('/contacts')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setSaving(false)
    }
  }


  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const isOverdue = (nextReminder: string | null | undefined) => {
    if (!nextReminder) return false
    return new Date(nextReminder) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-main)' }}>
        <LoadingSpinner />
      </div>
    )
  }

  if (!contact) {
    return (
      <AppLayout>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Contact not found</h3>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>This contact doesn&apos;t exist or you don&apos;t have permission to view it.</p>
              <Link href="/contacts">
                <Button>Back to Contacts</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/contacts">
              <Button variant="ghost" size="sm" style={{ color: '#12b5e5' }}>
                ← Back to Contacts
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 min-w-[4rem] min-h-[4rem] aspect-square rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#12b5e5' }}>
                <span className="text-3xl font-bold" style={{ color: '#231f20' }}>
                  {contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold break-words" style={{ color: '#f9f4da' }}>{contact.name}</h2>
                {contact.email && (
                  <p className="font-bold break-words break-all" style={{ color: '#f38ba3' }}>{contact.email}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-3 justify-end sm:justify-start sm:ml-auto">
              <Button 
                onClick={handleJustTalked}
                disabled={saving}
                className="hover:opacity-90 whitespace-nowrap" 
                style={{ backgroundColor: '#10b981' }}
              >
                {saving ? 'Updating...' : 'Just Talked'}
              </Button>
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-md text-sm mb-6" style={{ backgroundColor: '#ef444410', border: '1px solid #ef444420', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Name *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Email</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={{ borderColor: 'var(--text-primary)', opacity: 0.3, backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                          <option value="">Select...</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Birthday</label>
                        <Input
                          name="birthday"
                          type="date"
                          value={formData.birthday}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="flex w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent min-h-[80px]" style={{ borderColor: 'var(--text-primary)', opacity: 0.3, backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Email:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words break-all block">{contact.email || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Gender:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words block">{contact.gender || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Birthday:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words block">{contact.birthday ? formatDate(contact.birthday) : 'Not provided'}</span>
                    </div>
                    {contact.description && (
                      <div>
                        <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Description:</span>
                        <span style={{ color: 'var(--text-primary)' }} className="whitespace-pre-wrap break-words block">{contact.description}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work & Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Company</label>
                        <Input
                          name="work_company"
                          value={formData.work_company}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Position</label>
                        <Input
                          name="work_position"
                          value={formData.work_position}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>How We Met</label>
                      <Input
                        name="how_we_met"
                        value={formData.how_we_met}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Interests & Notes</label>
                      <textarea
                        name="interests"
                        value={formData.interests}
                        onChange={handleInputChange}
                        className="flex w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent min-h-[80px]" style={{ borderColor: 'var(--text-primary)', opacity: 0.3, backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Company:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words block">{contact.work_company || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Position:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words block">{contact.work_position || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>How We Met:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words block">{contact.how_we_met || 'Not provided'}</span>
                    </div>
                    {contact.interests && (
                      <div>
                        <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Interests:</span>
                        <span style={{ color: 'var(--text-primary)' }} className="whitespace-pre-wrap break-words block">{contact.interests}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reminder Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Reminder Interval (days)
                      </label>
                      <Input
                        name="reminder_days"
                        type="number"
                        min="1"
                        max="365"
                        value={formData.reminder_days}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="email_reminders"
                          name="email_reminders"
                          checked={formData.email_reminders}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded" style={{ color: '#f59e0b', borderColor: 'var(--text-primary)', opacity: 0.3 }}
                        />
                        <label htmlFor="email_reminders" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          Send email reminders
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="birthday_reminder"
                          name="birthday_reminder"
                          checked={formData.birthday_reminder}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded" style={{ color: '#f59e0b', borderColor: 'var(--text-primary)', opacity: 0.3 }}
                        />
                        <label htmlFor="birthday_reminder" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          Send birthday reminders
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Reminder Interval:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words block">Every {contact.reminder_days} days</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Email Reminders:</span>
                      <span style={{ color: contact.email_reminders ? '#10b981' : 'var(--text-secondary)' }} className="break-words block">
                        {contact.email_reminders ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Birthday Reminders:</span>
                      <span style={{ color: contact.birthday_reminder ? '#10b981' : 'var(--text-secondary)' }} className="break-words block">
                        {contact.birthday_reminder ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Last Conversation:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words block">{formatDate(contact.last_conversation)}</span>
                    </div>
                    {contact.next_reminder && (
                      <div>
                        <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Next Reminder:</span>
                        <span style={{ color: isOverdue(contact.next_reminder) ? '#ef4444' : 'var(--text-primary)' }} className="break-words block">
                          {formatDate(contact.next_reminder)}
                          {isOverdue(contact.next_reminder) && ' (Overdue)'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Added:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="break-words block">{formatDate(contact.created_at)}</span>
                </div>
                <div>
                  <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Last Updated:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="break-words block">{formatDate(contact.updated_at)}</span>
                </div>
              </CardContent>
            </Card>

            {!isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#ef4444' }}>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleDelete}
                    disabled={saving}
                    className="w-full bg-brand-pink text-brand-beige hover:bg-brand-pink/90"
                  >
                    Delete Contact
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  )
}