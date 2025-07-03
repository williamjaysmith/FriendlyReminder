"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { databases } from "@/lib/appwrite/client";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/types";
import { mapDocumentToContact } from "@/lib/appwrite/helpers";
import { Query } from "appwrite";
import { YearlyCalendarView } from "@/components/dashboard/yearly-calendar-view";
import { AppLayout } from "@/components/layout/app-layout";
import { Contact } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function CalendarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchContacts = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTACTS,
        [Query.equal("user_id", user?.$id || ""), Query.orderDesc("$createdAt")]
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

  const handleContactClick = (contact: Contact) => {
    router.push(`/contacts/${contact.id}`);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#231f20]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#f9f4da] mb-2">
            Calendar
          </h1>
          <p className="text-[#f38ba3] text-lg">
            View your networking schedule and never miss an important connection.
          </p>
        </div>

        <div className="mb-6 p-4 bg-transparent border-2 border-[#4a453f] rounded-lg" style={{ boxShadow: '8px 8px 0px #7b5ea7' }}>
          <h2 className="text-base font-bold text-brand-beige mb-2">
            How it works:
          </h2>
          <ul className="text-sm text-brand-beige space-y-1">
            <li>• <strong className="text-brand-blue">Blue dots</strong> indicate days with reach-out reminders</li>
            <li>• <strong className="text-brand-purple">Purple dots</strong> indicate days with birthdays</li>
            <li>• <strong className="text-brand-beige">Reminders</strong> are calculated based on each contact&apos;s reminder interval</li>
            <li>• <strong className="text-brand-beige">Birthdays</strong> appear for contacts with birthday reminders enabled</li>
            <li>• <strong className="text-brand-beige">Click</strong> any date with events to see details and contact the person</li>
          </ul>
        </div>

        <YearlyCalendarView 
          contacts={contacts} 
          onContactClick={handleContactClick}
        />

        <div className="mt-8 text-center text-sm text-[#262522]">
          <p>
            Calendar shows events up to 2 years in advance. 
            Reminder patterns are based on your contact preferences.
          </p>
        </div>
      </main>
    </AppLayout>
  );
}