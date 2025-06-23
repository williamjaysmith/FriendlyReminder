'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
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

  const sortContacts = (contactsToSort: Contact[]) => {
    return [...contactsToSort].sort((a, b) => {
      let aValue: string | Date | null = null
      let bValue: string | Date | null = null

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'company':
          aValue = (a.company || '').toLowerCase()
          bValue = (b.company || '').toLowerCase()
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
  }

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const sorted = sortContacts(filtered)
    setFilteredContacts(sorted)
  }, [contacts, searchTerm, sortField, sortDirection])


  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const isOverdue = (nextReminder: string | null | undefined) => {
    if (!nextReminder) return false
    return new Date(nextReminder) < new Date()
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
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
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Contacts</h2>
            <p className="text-[var(--text-secondary)]">
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
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>Sort by:</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleSort('name')}
              className={`${sortField === 'name' ? 'text-[var(--brand-yellow)]' : ''}`}
            >
              Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleSort('company')}
              className={`${sortField === 'company' ? 'text-[var(--brand-yellow)]' : ''}`}
            >
              Company {sortField === 'company' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
          </div>
        </div>

        {/* Contacts Table */}
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {contacts.length === 0 ? (
                <>
                  <div className="w-16 h-16 bg-[var(--text-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No contacts yet</h3>
                  <p className="text-[var(--text-secondary)] mb-4">Get started by adding your first contact</p>
                  <Link href="/contacts/add">
                    <Button>Add your first contact</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No matches found</h3>
                  <p className="text-[var(--text-secondary)]">Try adjusting your search terms</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--text-primary)]/20">
                    <th className="text-left p-4 font-semibold text-[var(--text-primary)]">
                      <button 
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 hover:text-[var(--brand-yellow)] transition-colors"
                      >
                        Name
                        {sortField === 'name' && (
                          <span className="text-[var(--brand-yellow)]">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4 font-semibold text-[var(--text-primary)]">
                      <button 
                        onClick={() => handleSort('company')}
                        className="flex items-center gap-1 hover:text-[var(--brand-yellow)] transition-colors"
                      >
                        Company
                        {sortField === 'company' && (
                          <span className="text-[var(--brand-yellow)]">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4 font-semibold text-[var(--text-primary)]">Email</th>
                    <th className="text-left p-4 font-semibold text-[var(--text-primary)]">
                      <button 
                        onClick={() => handleSort('last_conversation')}
                        className="flex items-center gap-1 hover:text-[var(--brand-yellow)] transition-colors"
                      >
                        Last Contact
                        {sortField === 'last_conversation' && (
                          <span className="text-[var(--brand-yellow)]">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4 font-semibold text-[var(--text-primary)]">
                      <button 
                        onClick={() => handleSort('next_reminder')}
                        className="flex items-center gap-1 hover:text-[var(--brand-yellow)] transition-colors"
                      >
                        Next Reminder
                        {sortField === 'next_reminder' && (
                          <span className="text-[var(--brand-yellow)]">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4 font-semibold text-[var(--text-primary)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[var(--brand-yellow)]/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-[var(--brand-yellow)]">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-[var(--text-primary)]">{contact.name}</div>
                            {contact.description && (
                              <div className="text-sm text-[var(--text-secondary)] truncate max-w-xs">
                                {contact.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[var(--text-primary)]">
                        {contact.company || '-'}
                      </td>
                      <td className="p-4 text-[var(--text-secondary)]">
                        {contact.email || '-'}
                      </td>
                      <td className="p-4 text-[var(--text-primary)]">
                        {formatDate(contact.last_conversation)}
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${
                          isOverdue(contact.next_reminder) 
                            ? 'text-[var(--brand-red)]' 
                            : 'text-[var(--text-primary)]'
                        }`}>
                          {formatDate(contact.next_reminder)}
                          {isOverdue(contact.next_reminder) && (
                            <span className="ml-1 text-xs bg-[var(--brand-red)]/20 text-[var(--brand-red)] px-1 py-0.5 rounded">
                              OVERDUE
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link href={`/contacts/${contact.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
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