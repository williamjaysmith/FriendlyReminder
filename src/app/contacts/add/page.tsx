'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AddContactPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
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
    reminder_days: 30
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([
          {
            user_id: user.id,
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
          }
        ])

      if (error) throw error

      router.push('/contacts')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/contacts">
              <Button variant="ghost" size="sm">
                ← Back to Contacts
              </Button>
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Contact</h2>
          <p className="text-gray-600">
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
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                      Birthday
                    </label>
                    <Input
                      id="birthday"
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of this person..."
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                  />
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Work Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="work_company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <Input
                      id="work_company"
                      name="work_company"
                      type="text"
                      value={formData.work_company}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="work_position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <Input
                      id="work_position"
                      name="work_position"
                      type="text"
                      value={formData.work_position}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
                
                <div>
                  <label htmlFor="how_we_met" className="block text-sm font-medium text-gray-700 mb-1">
                    How We Met
                  </label>
                  <Input
                    id="how_we_met"
                    name="how_we_met"
                    type="text"
                    placeholder="Conference, mutual friend, etc."
                    value={formData.how_we_met}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                    Interests & Notes
                  </label>
                  <textarea
                    id="interests"
                    name="interests"
                    placeholder="Their interests, hobbies, things to remember..."
                    value={formData.interests}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                  />
                </div>

                <div>
                  <label htmlFor="reminder_days" className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Interval (days)
                  </label>
                  <Input
                    id="reminder_days"
                    name="reminder_days"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.reminder_days}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    How often you want to be reminded to reach out (default: 30 days)
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
    </div>
  )
}