"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { databases } from "@/lib/appwrite/client";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/types";
import { mapDocumentToContact } from "@/lib/appwrite/helpers";
import { Query } from "appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/app-layout";
import { Contact } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type SortField = "name" | "company";
type SortDirection = "asc" | "desc";

export default function ContactsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const fetchContacts = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTACTS,
        [Query.equal("user_id", user?.$id || ""), Query.orderAsc("name")]
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contactsData = response.documents.map((doc: any) =>
        mapDocumentToContact(doc)
      );

      setContacts(contactsData);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoadingData(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchContacts();
    }
  }, [user, loading, router, fetchContacts]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortContacts = useCallback(
    (contactsToSort: Contact[]) => {
      return [...contactsToSort].sort((a, b) => {
        let aValue: string | Date | null = null;
        let bValue: string | Date | null = null;

        switch (sortField) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "company":
            aValue = (a.work_company || "").toLowerCase();
            bValue = (b.work_company || "").toLowerCase();
            break;
        }

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    },
    [sortField, sortDirection]
  );

  useEffect(() => {
    const filtered = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.work_company
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        contact.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sorted = sortContacts(filtered);
    setFilteredContacts(sorted);
  }, [contacts, searchTerm, sortField, sortDirection, sortContacts]);

  const isOverdue = (nextReminder: string | null | undefined) => {
    if (!nextReminder) return false;
    return new Date(nextReminder) < new Date();
  };

  const handleDeleteContact = async (contactId: string, contactName: string) => {
    if (!confirm(`Are you sure you want to delete ${contactName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.CONTACTS,
        contactId
      );
      
      // Update local state to remove the deleted contact
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Failed to delete contact. Please try again.");
    }
  };

  if (loading || loadingData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col min-[500px]:flex-row min-[500px]:justify-between min-[500px]:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-[#f9f4da]">
              Contacts
            </h2>
            <p className="text-[#f38ba3] font-bold">
              Manage your network of {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/contacts/add" className="self-start min-[500px]:self-auto">
            <Button>Add Contact</Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search contacts by name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
        </div>

        {/* Contacts Table */}
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {contacts.length === 0 ? (
                <>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#231f20] opacity-10"
                  >
                    <svg
                      className="w-8 h-8 text-[#262522]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3
                    className="text-lg font-medium mb-2 text-[#231f20]"
                  >
                    No contacts yet
                  </h3>
                  <p
                    className="mb-4 text-[#262522]"
                  >
                    Get started by adding your first contact
                  </p>
                  <Link href="/contacts/add">
                    <Button>Add your first contact</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3
                    className="text-lg font-medium mb-2 text-[#231f20]"
                  >
                    No matches found
                  </h3>
                  <p className="text-[#262522]">
                    Try adjusting your search terms
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b border-[#262522]"
                  >
                    <th
                      className="text-left p-4 font-semibold text-[#231f20]"
                    >
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 hover:text-brand-purple transition-colors"
                      >
                        Name
                        {sortField === "name" && (
                          <span className="rounded-full w-6 h-6 flex items-center justify-center text-sm" style={{ backgroundColor: '#12b5e5', color: '#f9f4da' }}>
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                    <th
                      className="text-left p-4 font-semibold text-[#231f20]"
                    >
                      <button
                        onClick={() => handleSort("company")}
                        className="flex items-center gap-1 hover:text-brand-purple transition-colors"
                      >
                        Company
                        {sortField === "company" && (
                          <span className="rounded-full w-6 h-6 flex items-center justify-center text-sm" style={{ backgroundColor: '#12b5e5', color: '#f9f4da' }}>
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                    <th
                      className="text-left p-4 font-semibold text-[#231f20]"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact, index) => {
                    const isLast = index === filteredContacts.length - 1;
                    return (
                      <tr
                        key={contact.id}
                        className={`h-16 transition-colors cursor-pointer hover:bg-[#f9f4da] hover:brightness-95 ${
                          !isLast ? "border-b border-[#262522]" : ""
                        }`}
                        onClick={() => router.push(`/contacts/${contact.id}`)}
                      >
                      <td className={`p-4 ${isLast ? "rounded-bl-[20px]" : ""}`}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: isOverdue(contact.next_reminder)
                                ? "#f38ba3"
                                : "#0ba95b"
                            }}
                            title={
                              isOverdue(contact.next_reminder)
                                ? "Overdue to contact"
                                : "Up to date"
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-medium truncate text-[#231f20]"
                            >
                              {contact.name}
                            </div>
                            <div
                              className="text-sm truncate text-[#262522]"
                            >
                              {contact.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className="p-4 text-[#231f20]"
                      >
                        <div className="truncate">
                          {contact.work_company || "-"}
                        </div>
                      </td>
                      <td className={`p-4 ${isLast ? "rounded-br-[20px]" : ""}`}>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/contacts/${contact.id}`);
                            }}
                            style={{ backgroundColor: '#f9f4da', color: '#231f20', border: '1px solid #231f20' }}
                            className="hover:!bg-[#f9f4da] hover:!opacity-100 font-bold"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContact(contact.id, contact.name);
                            }}
                            style={{ backgroundColor: '#f38ba3', color: '#231f20' }}
                            className="hover:opacity-90 font-bold"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </AppLayout>
  );
}
