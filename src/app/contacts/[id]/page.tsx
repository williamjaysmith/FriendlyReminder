'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { databases } from '@/lib/appwrite/client'
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/types'
import { Query } from 'appwrite'
import { mapDocumentToContact } from '@/lib/appwrite/helpers'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationModal } from '@/components/ui'
import { Toggle } from '@/components/ui/toggle'
import { AppLayout } from '@/components/layout/app-layout'
import { Contact, SocialLink } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useConfirmation } from '@/hooks'
import { GuestService } from '@/lib/services/GuestService'

export default function ContactDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const contactId = params.id as string
  const { confirmation, confirm } = useConfirmation()
  const [contact, setContact] = useState<Contact | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
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
    birthday_reminder: false
  })
  const [editingSocialLinks, setEditingSocialLinks] = useState<Array<{id?: string, platform: string, url: string, isNew?: boolean}>>([])
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '' })

  const fetchContact = useCallback(async () => {
    try {
      let contactData: Contact
      let socialLinksData: SocialLink[] = []

      if (user?.is_guest) {
        const guestContacts = GuestService.getGuestContacts()
        const foundContact = guestContacts.find(c => c.id === contactId)
        if (!foundContact) {
          throw new Error('Contact not found')
        }
        contactData = foundContact
        socialLinksData = foundContact.social_links || []
      } else {
        const response = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.CONTACTS,
          contactId
        )

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contactData = mapDocumentToContact(response as any)

        // Check if this contact belongs to the current user
        if (contactData.user_id !== user?.$id) {
          throw new Error('Contact not found')
        }

        // Fetch social links for this contact (non-blocking)
        try {
          console.log('Fetching social links for contact:', contactId)
          console.log('Using collection:', COLLECTIONS.SOCIAL_LINKS)
          
          const socialResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SOCIAL_LINKS,
            [Query.equal('contact_id', contactId)]
          )
          
          console.log('Social links response:', socialResponse)

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          socialLinksData = socialResponse.documents.map((doc: any) => ({
            id: doc.$id,
            contact_id: doc.contact_id,
            platform: doc.platform,
            url: doc.url,
            created_at: doc.$createdAt
          }))
        } catch (socialError) {
          console.warn('Failed to fetch social links:', socialError)
          // Continue without social links - don't break the contact loading
        }
      }

      setContact(contactData)
      setSocialLinks(socialLinksData)
      setEditingSocialLinks(socialLinksData.map(link => ({
        id: link.id,
        platform: link.platform,
        url: link.url
      })))
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
        birthday_reminder: contactData.birthday_reminder || false
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [contactId, user?.$id, user?.is_guest])

  useEffect(() => {
    if (authLoading) return // Wait for auth to finish loading
    
    if (!user) {
      router.push('/login')
      return
    }

    fetchContact()
  }, [user, authLoading, contactId, fetchContact, router])


  const handleToggleChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleAddSocialLink = async () => {
    if (newSocialLink.platform.trim() && newSocialLink.url.trim()) {
      try {
        console.log('Attempting to create social link with:', {
          DATABASE_ID,
          COLLECTION: COLLECTIONS.SOCIAL_LINKS,
          contact_id: contactId,
          platform: newSocialLink.platform.trim(),
          url: newSocialLink.url.trim()
        })
        
        // Save directly to database
        const result = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.SOCIAL_LINKS,
          'unique()',
          {
            contact_id: contactId,
            platform: newSocialLink.platform.trim(),
            url: newSocialLink.url.trim()
          }
        )
        
        console.log('Successfully created social link:', result)
        
        // Add to local state
        const newLink = {
          id: result.$id,
          contact_id: contactId,
          platform: newSocialLink.platform.trim(),
          url: newSocialLink.url.trim(),
          created_at: result.$createdAt
        }
        
        setSocialLinks(prev => {
          console.log('Adding to socialLinks:', newLink)
          const updated = [...prev, newLink]
          console.log('Updated socialLinks:', updated)
          return updated
        })
        setEditingSocialLinks(prev => [...prev, {
          id: result.$id,
          platform: newSocialLink.platform.trim(),
          url: newSocialLink.url.trim()
        }])
        
        // Clear the form
        setNewSocialLink({ platform: '', url: '' })
        console.log('Social link added successfully')
      } catch (error) {
        console.error('Failed to add social link:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        setError(`Failed to add social link: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleRemoveSocialLink = async (index: number) => {
    const linkToRemove = editingSocialLinks[index]
    
    if (linkToRemove.id) {
      try {
        // Delete from database
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SOCIAL_LINKS, linkToRemove.id)
        
        // Remove from local state
        setSocialLinks(prev => prev.filter(link => link.id !== linkToRemove.id))
        setEditingSocialLinks(prev => prev.filter((_, i) => i !== index))
      } catch (error) {
        console.error('Failed to remove social link:', error)
        setError('Failed to remove social link')
      }
    } else {
      // If it doesn't have an ID, it's only in local state
      setEditingSocialLinks(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleUpdateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setEditingSocialLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ))
  }

  const getSocialLinkIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase()
    if (lowerPlatform.includes('linkedin')) {
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    }
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) {
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    }
    if (lowerPlatform.includes('instagram')) {
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    }
    if (lowerPlatform.includes('github')) {
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    }
    // Default icon for other platforms
    return (
      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    )
  }

  const getSocialLinkButtonText = (platform: string) => {
    const lowerPlatform = platform.toLowerCase()
    if (lowerPlatform.includes('linkedin')) {
      return 'Message on LinkedIn'
    }
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) {
      return 'Message on X'
    }
    if (lowerPlatform.includes('instagram')) {
      return 'Message on Instagram'
    }
    if (lowerPlatform.includes('github')) {
      return 'Message on GitHub'
    }
    return `Message on ${platform}`
  }

  const getSocialLinkColor = () => {
    return '#12b5e5' // Use brand blue for all social media buttons
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
        birthday_reminder: formData.birthday_reminder
      }

      if (user?.is_guest) {
        GuestService.updateGuestContact(contactId, updateData)
      } else {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.CONTACTS,
          contactId,
          updateData
        )
      }

      // Handle social links updates (only for existing links that were modified)
      try {
        // Only update existing links that have been modified
        for (const link of editingSocialLinks) {
          if (link.id && link.platform.trim() && link.url.trim()) {
            // Check if this link was actually modified by comparing with original
            const originalLink = socialLinks.find(orig => orig.id === link.id)
            if (originalLink && (originalLink.platform !== link.platform.trim() || originalLink.url !== link.url.trim())) {
              await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.SOCIAL_LINKS,
                link.id,
                {
                  platform: link.platform.trim(),
                  url: link.url.trim()
                }
              )
            }
          }
        }
        
        // Update the local socialLinks state to reflect the changes
        const updatedSocialLinks = socialLinks.map(link => {
          const editedLink = editingSocialLinks.find(edited => edited.id === link.id)
          if (editedLink) {
            return {
              ...link,
              platform: editedLink.platform.trim(),
              url: editedLink.url.trim()
            }
          }
          return link
        })
        setSocialLinks(updatedSocialLinks)
      } catch (socialError) {
        console.error('Failed to update social links:', socialError)
        // Continue - don't break the contact saving
      }

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
      const now = new Date()
      const nextReminderDate = new Date(Date.now() + (contact?.reminder_days || 30) * 24 * 60 * 60 * 1000)
      
      const updateData = {
        last_conversation: user?.is_guest ? now.toISOString() : now.toISOString().split('T')[0],
        next_reminder: user?.is_guest ? nextReminderDate.toISOString() : nextReminderDate.toISOString().split('T')[0]
      }

      if (user?.is_guest) {
        GuestService.updateGuestContact(contactId, updateData)
      } else {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.CONTACTS,
          contactId,
          updateData
        )
      }

      await fetchContact()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Contact',
      message: `Are you sure you want to delete ${contact?.name || 'this contact'}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger'
    })

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (user?.is_guest) {
        GuestService.deleteGuestContact(contactId)
      } else {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.CONTACTS,
          contactId
        )
      }

      router.push('/contacts')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setSaving(false)
    }
  }


  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never'
    // Handle date-only strings (YYYY-MM-DD) to avoid timezone issues
    if (dateString.length === 10 && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return date.toLocaleDateString()
    }
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never'
    // Handle date-only strings (YYYY-MM-DD) - show just the date since there's no time info
    if (dateString.length === 10 && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return date.toLocaleDateString()
    }
    // For full timestamps, show date and time
    return new Date(dateString).toLocaleString()
  }

  const isOverdue = (nextReminder: string | null | undefined) => {
    if (!nextReminder) return false
    // Handle date-only strings (YYYY-MM-DD) to avoid timezone issues
    if (nextReminder.length === 10 && nextReminder.includes('-')) {
      const [year, month, day] = nextReminder.split('-')
      const reminderDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset to start of day for fair comparison
      return reminderDate < today
    }
    return new Date(nextReminder) < new Date()
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-main)' }}>
        <LoadingSpinner />
      </div>
    )
  }

  if (!contact) {
    return (
      <AppLayout>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <Link href="/contacts">
              <Button variant="ghost" size="sm" className="text-[#12b5e5]">
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
              {isEditing && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="border-[#f9f4da] text-[#f9f4da] hover:bg-[#f9f4da] hover:text-[#231f20] whitespace-nowrap"
                >
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleJustTalked}
                disabled={saving}
                className="hover:bg-[#0e9570] whitespace-nowrap bg-[#10b981]"
              >
                {saving ? 'Updating...' : 'Just Talked'}
              </Button>
              {isEditing ? (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
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
                        onChange={(value) => setFormData(prev => ({...prev, name: value}))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Email</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(value) => setFormData(prev => ({...prev, email: value}))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={(e) => setFormData(prev => ({...prev, gender: e.target.value}))}
                          className="flex h-10 w-full rounded-md border border-[#231f20]/30 bg-[#fefaf0] px-3 py-2 text-sm text-[#231f20] focus:outline-none focus:ring-2 focus:ring-[#fcba28] focus:border-transparent"
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
                          onChange={(value) => setFormData(prev => ({...prev, birthday: value}))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                        autoExpand
                        placeholder="Add a description..."
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Email:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words min-w-0">{contact.email || 'Not provided'}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Gender:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words min-w-0">{contact.gender || 'Not provided'}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Birthday:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words min-w-0">{contact.birthday ? formatDate(contact.birthday) : 'Not provided'}</span>
                    </div>
                    {contact.description && (
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Description:</span>
                        <span style={{ color: 'var(--text-primary)' }} className="whitespace-pre-wrap break-words min-w-0">{contact.description}</span>
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
                          onChange={(value) => setFormData(prev => ({...prev, work_company: value}))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Position</label>
                        <Input
                          name="work_position"
                          value={formData.work_position}
                          onChange={(value) => setFormData(prev => ({...prev, work_position: value}))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>How We Met</label>
                      <Textarea
                        name="how_we_met"
                        value={formData.how_we_met}
                        onChange={(e) => setFormData(prev => ({...prev, how_we_met: e.target.value}))}
                        autoExpand
                        placeholder="Tell the story of how you met..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Interests & Notes</label>
                      <Textarea
                        name="interests"
                        value={formData.interests}
                        onChange={(e) => setFormData(prev => ({...prev, interests: e.target.value}))}
                        autoExpand
                        placeholder="Add interests, hobbies, or other notes..."
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Company:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words min-w-0">{contact.work_company || 'Not provided'}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Position:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words min-w-0">{contact.work_position || 'Not provided'}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>How We Met:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words min-w-0">{contact.how_we_met || 'Not provided'}</span>
                    </div>
                    {contact.interests && (
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Interests:</span>
                        <span style={{ color: 'var(--text-primary)' }} className="whitespace-pre-wrap break-words min-w-0">{contact.interests}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    {/* Existing social links */}
                    {editingSocialLinks.map((link, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Platform</label>
                          <Input
                            value={link.platform}
                            onChange={(value) => handleUpdateSocialLink(index, 'platform', value)}
                            placeholder="e.g., LinkedIn, Website, Instagram"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>URL</label>
                          <Input
                            type="url"
                            value={link.url}
                            onChange={(value) => handleUpdateSocialLink(index, 'url', value)}
                            placeholder="https://..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(index)}
                          className="mb-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{ 
                            backgroundColor: '#f38ba3', 
                            color: '#231f20', 
                            borderColor: '#f38ba3',
                            border: '1px solid #f38ba3'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f38ba3e6'; // 90% opacity
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f38ba3';
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    {/* Add new social link */}
                    <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Platform</label>
                          <Input
                            value={newSocialLink.platform}
                            onChange={(value) => setNewSocialLink(prev => ({ ...prev, platform: value }))}
                            placeholder="e.g., LinkedIn, Website, Instagram"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>URL</label>
                          <Input
                            type="url"
                            value={newSocialLink.url}
                            onChange={(value) => setNewSocialLink(prev => ({ ...prev, url: value }))}
                            placeholder="https://..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (newSocialLink.platform.trim() && newSocialLink.url.trim()) {
                              handleAddSocialLink();
                            }
                          }}
                          className="mb-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{ 
                            backgroundColor: '#12b5e5', 
                            color: '#231f20', 
                            borderColor: '#12b5e5',
                            border: '1px solid #12b5e5',
                            cursor: (!newSocialLink.platform.trim() || !newSocialLink.url.trim()) ? 'not-allowed' : 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (newSocialLink.platform.trim() && newSocialLink.url.trim()) {
                              e.currentTarget.style.backgroundColor = '#12b5e5e6'; // 90% opacity
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#12b5e5';
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.length > 0 ? (
                      socialLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:opacity-90 transition-opacity break-all"
                          style={{ backgroundColor: getSocialLinkColor() }}
                        >
                          {getSocialLinkIcon(link.platform)}
                          <span className="ml-2">{getSocialLinkButtonText(link.platform)}</span>
                        </a>
                      ))
                    ) : (
                      <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                        No social links added yet
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
                        value={formData.reminder_days.toString()}
                        onChange={(value) => setFormData(prev => ({...prev, reminder_days: parseInt(value) || 0}))}
                      />
                    </div>
                    <div className="space-y-4">
                      <Toggle
                        id="birthday_reminder"
                        checked={formData.birthday_reminder}
                        onChange={(checked) => handleToggleChange('birthday_reminder', checked)}
                        label="Enable birthday reminders"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Reminder Interval:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words min-w-0">Every {contact.reminder_days} days</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Birthday Reminders:</span>
                      <span style={{ color: contact.birthday_reminder ? '#10b981' : 'var(--text-secondary)' }} className="break-words min-w-0">
                        {contact.birthday_reminder ? 'Enabled 🎂' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Last Conversation:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="break-words min-w-0">{formatDateTime(contact.last_conversation)}</span>
                    </div>
                    {contact.next_reminder && (
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Reach Out By:</span>
                        <span style={{ color: isOverdue(contact.next_reminder) ? '#ef4444' : 'var(--text-primary)' }} className="break-words min-w-0">
                          {formatDateTime(contact.next_reminder)}
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
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Added:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="break-words min-w-0">{formatDate(contact.created_at)}</span>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Last Updated:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="break-words min-w-0">{formatDate(contact.updated_at)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#E4405F' }}>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button 
                  onClick={handleDelete}
                  disabled={saving}
                  className="max-w-40 font-bold hover:bg-[#CC3A56]"
                  style={{ backgroundColor: '#E4405F', color: '#f9f4da' }}
                >
                  Delete Contact
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        confirmVariant={confirmation.confirmVariant}
      />
    </AppLayout>
  )
}