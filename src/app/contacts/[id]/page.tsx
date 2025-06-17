'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Contact } from '@/lib/types'

export default function ContactDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const contactId = params.id as string
  const supabase = createClient()
  
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
    reminder_days: 30
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchContact()
  }, [user, contactId])

  const fetchContact = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error

      setContact(data)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        gender: data.gender || '',
        birthday: data.birthday || '',
        description: data.description || '',
        work_company: data.work_company || '',
        work_position: data.work_position || '',
        how_we_met: data.how_we_met || '',
        interests: data.interests || '',
        reminder_days: data.reminder_days || 30
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          name: formData.name,
          email: formData.email || null,
          gender: formData.gender || null,
          birthday: formData.birthday || null,
          description: formData.description || null,
          work_company: formData.work_company || null,
          work_position: formData.work_position || null,
          how_we_met: formData.how_we_met || null,
          interests: formData.interests || null,
          reminder_days: formData.reminder_days
        })
        .eq('id', contactId)
        .eq('user_id', user?.id)

      if (error) throw error

      await fetchContact()
      setIsEditing(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleJustTalked = async () => {
    setSaving(true)
    setError(null)

    try {
      const now = new Date().toISOString()
      const nextReminder = new Date(Date.now() + (contact?.reminder_days || 30) * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase
        .from('contacts')
        .update({
          last_conversation: now,
          next_reminder: nextReminder
        })
        .eq('id', contactId)
        .eq('user_id', user?.id)

      if (error) throw error

      await fetchContact()
    } catch (error: any) {
      setError(error.message)
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
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('user_id', user?.id)

      if (error) throw error

      router.push('/contacts')
    } catch (error: any) {
      setError(error.message)
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Friendly Reminder
                </h1>
              </div>
              <nav className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/contacts" className="text-gray-600 hover:text-gray-900">
                  Contacts
                </Link>
                <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                  Settings
                </Link>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contact not found</h3>
              <p className="text-gray-600 mb-4">This contact doesn&apos;t exist or you don&apos;t have permission to view it.</p>
              <Link href="/contacts">
                <Button>Back to Contacts</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Friendly Reminder
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/contacts" className="text-gray-600 hover:text-gray-900">
                Contacts
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                Settings
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/contacts">
              <Button variant="ghost" size="sm">
                ← Back to Contacts
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-blue-600">
                  {contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{contact.name}</h2>
                {contact.email && (
                  <p className="text-gray-600">{contact.email}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleJustTalked}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
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
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select...</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                        <Input
                          name="birthday"
                          type="date"
                          value={formData.birthday}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Email</span>
                        <p className="font-medium">{contact.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Gender</span>
                        <p className="font-medium">{contact.gender || 'Not provided'}</p>
                      </div>
                    </div>
                    {contact.birthday && (
                      <div>
                        <span className="text-sm text-gray-500">Birthday</span>
                        <p className="font-medium">{formatDate(contact.birthday)}</p>
                      </div>
                    )}
                    {contact.description && (
                      <div>
                        <span className="text-sm text-gray-500">Description</span>
                        <p className="font-medium">{contact.description}</p>
                      </div>
                    )}
                  </>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <Input
                          name="work_company"
                          value={formData.work_company}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <Input
                          name="work_position"
                          value={formData.work_position}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">How We Met</label>
                      <Input
                        name="how_we_met"
                        value={formData.how_we_met}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interests & Notes</label>
                      <textarea
                        name="interests"
                        value={formData.interests}
                        onChange={handleInputChange}
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Company</span>
                        <p className="font-medium">{contact.work_company || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Position</span>
                        <p className="font-medium">{contact.work_position || 'Not provided'}</p>
                      </div>
                    </div>
                    {contact.how_we_met && (
                      <div>
                        <span className="text-sm text-gray-500">How We Met</span>
                        <p className="font-medium">{contact.how_we_met}</p>
                      </div>
                    )}
                    {contact.interests && (
                      <div>
                        <span className="text-sm text-gray-500">Interests & Notes</span>
                        <p className="font-medium whitespace-pre-wrap">{contact.interests}</p>
                      </div>
                    )}
                  </>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                ) : (
                  <div>
                    <span className="text-sm text-gray-500">Reminder Interval</span>
                    <p className="font-medium">Every {contact.reminder_days} days</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-gray-500">Last Conversation</span>
                  <p className="font-medium">{formatDate(contact.last_conversation)}</p>
                </div>
                
                {contact.next_reminder && (
                  <div>
                    <span className="text-sm text-gray-500">Next Reminder</span>
                    <p className={`font-medium ${
                      isOverdue(contact.next_reminder) ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {formatDate(contact.next_reminder)}
                      {isOverdue(contact.next_reminder) && ' (Overdue)'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Added</span>
                  <p className="font-medium">{formatDate(contact.created_at)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <p className="font-medium">{formatDate(contact.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {!isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={saving}
                    className="w-full"
                  >
                    Delete Contact
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}