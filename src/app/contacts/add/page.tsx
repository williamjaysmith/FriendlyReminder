'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { databases, ID } from '@/lib/appwrite/client'
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/types'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppLayout } from '@/components/layout/app-layout'
import { GuestService } from '@/lib/services/GuestService'

export default function AddContactPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
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
    birthday_reminder: true
  })

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleToggleChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const now = new Date()
      const nextReminderDate = new Date(now.getTime() + formData.reminder_days * 24 * 60 * 60 * 1000)
      
      if (user.is_guest) {
        const guestContactData = {
          name: formData.name,
          email: formData.email || undefined,
          gender: formData.gender || undefined,
          birthday: formData.birthday || undefined,
          notes: formData.description || undefined,
          work_company: formData.work_company || undefined,
          work_position: formData.work_position || undefined,
          how_we_met: formData.how_we_met || undefined,
          interests: formData.interests || undefined,
          reminder_days: formData.reminder_days,
          birthday_reminder: formData.birthday_reminder,
          last_conversation: now.toISOString(),
          next_reminder: nextReminderDate.toISOString(),
          social_links: []
        }

        GuestService.addGuestContact(guestContactData)
      } else {
        const contactData = {
          user_id: user.$id,
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
          birthday_reminder: formData.birthday_reminder,
          last_conversation: now.toISOString().split('T')[0], // YYYY-MM-DD format (10 chars)
          next_reminder: nextReminderDate.toISOString().split('T')[0] // YYYY-MM-DD format (10 chars)
        }

        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.CONTACTS,
          ID.unique(),
          contactData
        )
      }

      router.push('/contacts')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }


  return (
    <AppLayout>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/contacts">
              <Button variant="ghost" size="sm">
                ← Back to Contacts
              </Button>
            </Link>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#f9f4da' }}>Add New Contact</h2>
          <p style={{ color: '#f38ba3' }}>
            Add someone new to your network and set up reminders to stay in touch.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Fill in the details below. Only the name is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="px-4 py-3 rounded-md text-sm mb-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'rgb(239, 68, 68)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium" style={{ color: '#231f20' }}>Basic Information</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: '#231f20' }}>
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#231f20' }}>
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium mb-1" style={{ color: '#231f20' }}>
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleSelectChange}
                      disabled={loading}
                      className="flex h-10 w-full rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ 
                        border: '1px solid #ddd', 
                        backgroundColor: '#fefaf0', 
                        color: '#231f20' 
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="birthday" className="block text-sm font-medium mb-1" style={{ color: '#231f20' }}>
                      Birthday
                    </label>
                    <Input
                      id="birthday"
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(value) => setFormData(prev => ({ ...prev, birthday: value }))}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: '#231f20' }}>
                    Short Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of this person..."
                    value={formData.description}
                    onChange={handleTextareaChange}
                    disabled={loading}
                    className="flex w-full rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                    style={{ 
                      border: '1px solid #ddd', 
                      backgroundColor: '#fefaf0', 
                      color: '#231f20' 
                    }}
                  />
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium" style={{ color: '#231f20' }}>Work Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="work_company" className="block text-sm font-medium mb-1" style={{ color: '#231f20' }}>
                      Company
                    </label>
                    <Input
                      id="work_company"
                      name="work_company"
                      type="text"
                      value={formData.work_company}
                      onChange={(value) => setFormData(prev => ({ ...prev, work_company: value }))}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="work_position" className="block text-sm font-medium mb-1" style={{ color: '#231f20' }}>
                      Position
                    </label>
                    <Input
                      id="work_position"
                      name="work_position"
                      type="text"
                      value={formData.work_position}
                      onChange={(value) => setFormData(prev => ({ ...prev, work_position: value }))}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium" style={{ color: '#231f20' }}>Additional Information</h3>
                
                <div>
                  <label htmlFor="how_we_met" className="block text-sm font-medium mb-1" style={{ color: '#231f20' }}>
                    How We Met
                  </label>
                  <Input
                    id="how_we_met"
                    name="how_we_met"
                    type="text"
                    placeholder="Conference, mutual friend, etc."
                    value={formData.how_we_met}
                    onChange={(value) => setFormData(prev => ({ ...prev, how_we_met: value }))}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="interests" className="block text-sm font-medium mb-1" style={{ color: '#231f20' }}>
                    Interests & Notes
                  </label>
                  <textarea
                    id="interests"
                    name="interests"
                    placeholder="Their interests, hobbies, things to remember..."
                    value={formData.interests}
                    onChange={handleTextareaChange}
                    disabled={loading}
                    className="flex w-full rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                    style={{ 
                      border: '1px solid #ddd', 
                      backgroundColor: '#fefaf0', 
                      color: '#231f20' 
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="reminder_days" className="block text-sm font-medium mb-1" style={{ color: '#231f20' }}>
                    Reminder Interval (days)
                  </label>
                  <Input
                    id="reminder_days"
                    name="reminder_days"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.reminder_days.toString()}
                    onChange={(value) => setFormData(prev => ({ ...prev, reminder_days: parseInt(value) || 0 }))}
                    disabled={loading}
                  />
                  <p className="text-sm mt-1" style={{ color: '#262522' }}>
                    How often you want to be reminded to reach out (default: 30 days)
                  </p>
                </div>

                <div>
                  <Toggle
                    id="birthday_reminder"
                    checked={formData.birthday_reminder}
                    onChange={(checked) => handleToggleChange('birthday_reminder', checked)}
                    label="Enable birthday reminders"
                    disabled={loading}
                  />
                  <p className="text-sm mt-1" style={{ color: '#262522' }}>
                    If enabled and this contact has a birthday, it will appear as a special reminder on your dashboard
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/contacts">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding Contact...' : 'Add Contact'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  )
}