'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { useTheme } from '@/components/theme/theme-provider'
import { databases } from '@/lib/appwrite/client'
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/types'
import { mapDocumentToContact } from '@/lib/appwrite/helpers'
import { Query } from 'appwrite'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { AppLayout } from '@/components/layout/app-layout'
import { Contact } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

type SortField = 'name' | 'company' | 'last_conversation' | 'next_reminder'
type SortDirection = 'asc' | 'desc'

export default function ContactsPage() {
  const { user, loading } = useAuth()
  const { actualTheme } = useTheme()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const fetchContacts = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTACTS,
        [
          Query.equal('user_id', user?.$id || ''),
          Query.orderAsc('name')
        ]
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contactsData = response.documents.map((doc: any) => mapDocumentToContact(doc))

      setContacts(contactsData)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoadingData(false)
    }
  }, [user?.$id])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchContacts()
    }
  }, [user, loading, router, fetchContacts])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortContacts = useCallback((contactsToSort: Contact[]) => {
    return [...contactsToSort].sort((a, b) => {
      let aValue: string | Date | null = null
      let bValue: string | Date | null = null

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'company':
          aValue = (a.work_company || '').toLowerCase()
          bValue = (b.work_company || '').toLowerCase()
          break
        case 'last_conversation':
          aValue = a.last_conversation ? new Date(a.last_conversation) : new Date(0)
          bValue = b.last_conversation ? new Date(b.last_conversation) : new Date(0)
          break
        case 'next_reminder':
          aValue = a.next_reminder ? new Date(a.next_reminder) : new Date(0)
          bValue = b.next_reminder ? new Date(b.next_reminder) : new Date(0)
          break
      }

      if (aValue === null && bValue === null) return 0
      if (aValue === null) return 1
      if (bValue === null) return -1

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [sortField, sortDirection])

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.work_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const sorted = sortContacts(filtered)
    setFilteredContacts(sorted)
  }, [contacts, searchTerm, sortField, sortDirection, sortContacts])



  const isOverdue = (nextReminder: string | null | undefined) => {
    if (!nextReminder) return false
    return new Date(nextReminder) < new Date()
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-main)' }}>
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Contacts</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your network of {contacts.length} contacts
            </p>
          </div>
          <Link href="/contacts/add">
            <Button>Add Contact</Button>
          </Link>
        </div>

        {/* Search Bar and Sort Controls */}
        <div className="mb-6 flex gap-4 items-center">
          <Input
            type="text"
            placeholder="Search contacts by name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>SORT BY:</span>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as SortField)}
              className="flex h-9 rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
              style={{ 
                borderColor: 'var(--text-primary)', 
                backgroundColor: 'var(--bg-card)', 
                color: 'var(--text-primary)' 
              }}
            >
              <option value="name">Name</option>
              <option value="company">Company</option>
            </select>
          </div>
        </div>

        {/* Contacts Table */}
        {filteredContacts.length === 0 ? (
          <Card style={{ backgroundColor: 'var(--bg-card)' }}>
            <CardContent className="text-center py-12">
              {contacts.length === 0 ? (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--text-primary)', opacity: 0.1 }}>
                    <svg className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No contacts yet</h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Get started by adding your first contact</p>
                  <Link href="/contacts/add">
                    <Button>Add your first contact</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No matches found</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search terms</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card style={{ 
            backgroundColor: 'var(--bg-card)',
            border: actualTheme === 'light' ? '1px solid #231f20' : 'none',
            boxShadow: actualTheme === 'light' 
              ? '0 15px 35px rgba(123, 94, 167, 0.3), 0 8px 15px rgba(123, 94, 167, 0.2)' 
              : '0 10px 25px rgba(0, 0, 0, 0.04), 0 4px 10px rgba(0, 0, 0, 0.03)'
          }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--text-secondary)' }}>
                    <th className="text-left p-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                      <button 
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 hover:text-brand-purple transition-colors"
                      >
                        Name
                        {sortField === 'name' && (
                          <span className="text-brand-purple">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                      <button 
                        onClick={() => handleSort('company')}
                        className="flex items-center gap-1 hover:text-brand-purple transition-colors"
                      >
                        Company
                        {sortField === 'company' && (
                          <span className="text-brand-purple">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="text-center p-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
                    <th className="text-left p-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact, index) => (
                    <tr 
                      key={contact.id} 
                      className="h-16 transition-colors cursor-pointer"
                      style={{
                        borderBottom: index < filteredContacts.length - 1 ? '1px solid var(--text-secondary)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                        e.currentTarget.style.filter = 'brightness(0.95)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.filter = 'none';
                      }}
                      onClick={() => router.push(`/contacts/${contact.id}`)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--text-secondary)', opacity: 0.2 }}>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{contact.name}</div>
                            <div className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                              {contact.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4" style={{ color: 'var(--text-primary)' }}>
                        <div className="truncate">{contact.work_company || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <div className="w-3 h-3 rounded-full border" style={{
                            borderColor: 'var(--text-secondary)',
                            backgroundColor: isOverdue(contact.next_reminder) 
                              ? 'var(--text-primary)' 
                              : 'var(--text-secondary)'
                          }} 
                          title={isOverdue(contact.next_reminder) ? 'Overdue to contact' : 'Up to date'}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/contacts/${contact.id}`);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </AppLayout>
  )
}