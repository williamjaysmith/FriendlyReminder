"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { databases } from "@/lib/appwrite/client";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/types";
import { mapDocumentToContact } from "@/lib/appwrite/helpers";
import { Query } from "appwrite";
import Button from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppLayout } from "@/components/layout/app-layout";
import { Contact } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { GuestService } from "@/lib/services/GuestService";

type SortDirection = "asc" | "desc";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [overdueContacts, setOverdueContacts] = useState<Contact[]>([]);
  const [upcomingContacts, setUpcomingContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  // const [stats, setStats] = useState({
  //   total: 0,
  //   upcoming: 0,
  // });
  const [loadingData, setLoadingData] = useState(true);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [upcomingFilter, setUpcomingFilter] = useState<7 | 14>(7);
  const [showAllOverdue, setShowAllOverdue] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      let contactsData: Contact[] = [];

      // Handle guest mode
      if (GuestService.isGuestMode()) {
        contactsData = GuestService.getGuestContacts();
      } else {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.CONTACTS,
          [Query.equal("user_id", user?.$id || ""), Query.orderDesc("$createdAt")]
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contactsData = response.documents.map((doc: any) =>
          mapDocumentToContact(doc)
        );
      }

      setAllContacts(contactsData);

      const now = new Date();
      const filterDaysFromNow = new Date(
        now.getTime() + upcomingFilter * 24 * 60 * 60 * 1000
      );

      const overdue = contactsData.filter(
        (contact) =>
          contact.next_reminder && new Date(contact.next_reminder) < now
      );

      const upcoming = contactsData.filter(
        (contact) =>
          contact.next_reminder &&
          new Date(contact.next_reminder) >= now &&
          new Date(contact.next_reminder) <= filterDaysFromNow
      );

      // Get upcoming birthdays within the same timeframe
      const upcomingBirthdays = getUpcomingBirthdays(contactsData, upcomingFilter);
      
      // Debug logging
      console.log('All contacts:', contactsData.length);
      console.log('Contacts with birthdays:', contactsData.filter(c => c.birthday).length);
      console.log('Contacts with birthday_reminder enabled:', contactsData.filter(c => c.birthday_reminder).length);
      console.log('Upcoming birthdays found:', upcomingBirthdays.length);
      upcomingBirthdays.forEach(contact => {
        console.log(`Birthday contact: ${contact.name}, birthday: ${contact.birthday}, birthday_reminder: ${contact.birthday_reminder}`);
      });

      // Combine upcoming contacts and birthday reminders, removing duplicates
      const upcomingContactIds = new Set(upcoming.map(c => c.id));
      const uniqueBirthdayContacts = upcomingBirthdays.filter(c => !upcomingContactIds.has(c.id));
      const combinedUpcoming = [...upcoming, ...uniqueBirthdayContacts];

      setOverdueContacts(overdue);
      setUpcomingContacts(combinedUpcoming);
      // setStats({
      //   total: contactsData.length,
      //   upcoming: combinedUpcoming.length,
      // });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  }, [user?.$id, upcomingFilter]);

  const getOverdueDays = (nextReminder: string | null | undefined) => {
    if (!nextReminder) return 0;
    const now = new Date();
    const reminderDate = new Date(nextReminder);
    return Math.floor((now.getTime() - reminderDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getUpcomingDays = (nextReminder: string | null | undefined) => {
    if (!nextReminder) return 0;
    const now = new Date();
    const reminderDate = new Date(nextReminder);
    return Math.ceil((reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Helper function to check if a contact has a birthday within the next N days
  const getUpcomingBirthdays = (contacts: Contact[], daysAhead: number = 7) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    return contacts.filter(contact => {
      console.log(`Checking contact: ${contact.name}`);
      console.log(`- birthday: ${contact.birthday}`);
      console.log(`- birthday_reminder: ${contact.birthday_reminder}`);
      
      if (!contact.birthday || !contact.birthday_reminder) {
        console.log(`- Skipped: missing birthday (${!contact.birthday}) or reminder disabled (${!contact.birthday_reminder})`);
        return false;
      }
      
      try {
        // Parse the birthday (assuming YYYY-MM-DD format)
        const [, month, day] = contact.birthday.split('-');
        console.log(`- Parsed birthday: month=${month}, day=${day}`);
        
        // Create birthday date for this year
        const thisYearBirthday = new Date(currentYear, parseInt(month) - 1, parseInt(day));
        console.log(`- This year birthday: ${thisYearBirthday.toDateString()}`);
        
        // If birthday has passed this year, check next year
        let birthdayToCheck = thisYearBirthday;
        if (thisYearBirthday < now) {
          birthdayToCheck = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
          console.log(`- Using next year birthday: ${birthdayToCheck.toDateString()}`);
        }
        
        // Check if birthday is within the next N days
        const daysDiff = Math.ceil((birthdayToCheck.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`- Days until birthday: ${daysDiff}, checking against ${daysAhead} days ahead`);
        const isUpcoming = daysDiff >= 0 && daysDiff <= daysAhead;
        console.log(`- Is upcoming: ${isUpcoming}`);
        
        return isUpcoming;
      } catch (error) {
        console.log(`- Error parsing birthday: ${error}`);
        return false;
      }
    });
  };

  // Helper function to get days until birthday
  const getDaysUntilBirthday = (birthday: string | null | undefined) => {
    if (!birthday) return 0;
    
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const [, month, day] = birthday.split('-');
      
      let thisYearBirthday = new Date(currentYear, parseInt(month) - 1, parseInt(day));
      
      // If birthday has passed this year, check next year
      if (thisYearBirthday < now) {
        thisYearBirthday = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
      }
      
      return Math.ceil((thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Helper function to check if a contact is being shown because of a birthday reminder
  const isBirthdayReminder = (contact: Contact) => {
    if (!contact.birthday || !contact.birthday_reminder) return false;
    
    const daysUntilBirthday = getDaysUntilBirthday(contact.birthday);
    return daysUntilBirthday >= 0 && daysUntilBirthday <= upcomingFilter;
  };

  const handleUpcomingFilterToggle = () => {
    setUpcomingFilter(upcomingFilter === 7 ? 14 : 7);
  };

  const sortOverdueContacts = useCallback(
    (contactsToSort: Contact[]) => {
      return [...contactsToSort].sort((a, b) => {
        const aDays = getOverdueDays(a.next_reminder);
        const bDays = getOverdueDays(b.next_reminder);
        
        if (sortDirection === "desc") {
          return bDays - aDays; // Most overdue first
        } else {
          return aDays - bDays; // Least overdue first
        }
      });
    },
    [sortDirection]
  );

  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, loading, router, fetchDashboardData]);

  useEffect(() => {
    setOverdueContacts(prev => sortOverdueContacts(prev));
  }, [sortDirection, sortOverdueContacts]);

  if (loading || loadingData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#231f20]"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8">
          {GuestService.isGuestMode() && (
            <div className="mb-4 p-3 bg-[#7b5ea7]/20 border border-[#7b5ea7] rounded-lg">
              <p className="text-[#7b5ea7] font-medium text-sm">
                🎭 Guest Mode - You&apos;re exploring with dummy data. Changes won&apos;t be saved.
              </p>
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2 text-[#f9f4da]">
            Welcome back, {user.name || user.email}!
          </h2>
          <p className="text-[#f38ba3] font-bold">
            Here&apos;s what&apos;s happening with your network today.
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          <CalendarView 
            contacts={allContacts} 
            onContactClick={(contact) => router.push(`/contacts/${contact.id}`)}
          />
          <Card className="w-full max-w-96" style={{
            boxShadow: "8px 8px 0px #7b5ea7"
          }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overdue ({overdueContacts.length})</span>
                {overdueContacts.length > 0 && (
                  <button
                    onClick={handleSort}
                    className="flex items-center gap-1 hover:text-brand-purple transition-colors text-sm"
                  >
                    Sort
                    <span className="rounded-full w-6 h-6 flex items-center justify-center text-sm" style={{ backgroundColor: '#12b5e5', color: '#f9f4da' }}>
                      {sortDirection === "desc" ? "↓" : "↑"}
                    </span>
                  </button>
                )}
              </CardTitle>
              <CardDescription>
                Contacts you need to reach out to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueContacts.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#0ba95b]/20">
                    <svg
                      className="w-8 h-8 text-[#0ba95b]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="mb-4 text-[#262522]">
                    All caught up!
                  </p>
                  <p className="text-sm text-[#262522]">
                    No overdue contacts to reach out to
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(showAllOverdue ? overdueContacts : overdueContacts.slice(0, 5)).map((contact) => {
                    const overdueDays = getOverdueDays(contact.next_reminder);
                    return (
                      <div
                        key={contact.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-[#f9f4da] hover:brightness-95 p-2 rounded-md -m-2 transition-colors"
                        onClick={() => router.push(`/contacts/${contact.id}`)}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 min-w-[2rem] min-h-[2rem] aspect-square bg-[#f38ba3]/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-[#f38ba3]">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[#231f20]">
                            {contact.name}
                          </p>
                          <p className="text-sm text-[#f38ba3] font-medium">
                            {overdueDays === 0 
                              ? "Overdue today"
                              : `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`}
                          </p>
                        </div>
                        <svg
                          className="w-4 h-4 text-[#262522] shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    );
                  })}
                  {overdueContacts.length > 5 && (
                    <button
                      onClick={() => setShowAllOverdue(!showAllOverdue)}
                      className="w-full text-center py-2 text-sm text-[#f38ba3] hover:text-[#f38ba3]/80 transition-colors border-t border-gray-200 mt-3 pt-3"
                    >
                      {showAllOverdue ? 
                        `Show less (${overdueContacts.length - 5} hidden)` : 
                        `Show ${overdueContacts.length - 5} more`}
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full max-w-96" style={{
            boxShadow: "8px 8px 0px #7b5ea7"
          }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming ({upcomingContacts.length})</span>
                <button
                  onClick={handleUpcomingFilterToggle}
                  className="flex items-center gap-1 hover:text-brand-purple transition-colors text-sm"
                >
                  Days
                  <span className="rounded-full w-6 h-6 flex items-center justify-center text-sm" style={{ backgroundColor: '#0ba95b', color: '#f9f4da' }}>
                    {upcomingFilter}
                  </span>
                </button>
              </CardTitle>
              <CardDescription>
                Contacts to reach out to in the next {upcomingFilter} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingContacts.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#0ba95b]/20">
                    <svg
                      className="w-8 h-8 text-[#0ba95b]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="mb-4 text-[#262522]">
                    No upcoming contacts
                  </p>
                  <p className="text-sm text-[#262522]">
                    No contacts need to be reached out to in the next {upcomingFilter} days
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(showAllUpcoming ? upcomingContacts : upcomingContacts.slice(0, 5)).map((contact) => {
                    const isBirthday = isBirthdayReminder(contact);
                    const upcomingDays = isBirthday ? getDaysUntilBirthday(contact.birthday) : getUpcomingDays(contact.next_reminder);
                    return (
                      <div
                        key={contact.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-[#f9f4da] hover:brightness-95 p-2 rounded-md -m-2 transition-colors"
                        onClick={() => router.push(`/contacts/${contact.id}`)}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 min-w-[2rem] min-h-[2rem] aspect-square bg-[#0ba95b]/20 rounded-full flex items-center justify-center">
                            {isBirthday ? (
                              <span className="text-lg">🎂</span>
                            ) : (
                              <span className="text-sm font-medium text-[#0ba95b]">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[#231f20]">
                            {contact.name} {isBirthday ? '🎂' : ''}
                          </p>
                          <p className="text-sm text-[#0ba95b] font-medium">
                            {isBirthday ? (
                              upcomingDays === 0 
                                ? "Birthday today!" 
                                : upcomingDays === 1
                                ? "Birthday tomorrow!"
                                : `Birthday in ${upcomingDays} days`
                            ) : (
                              upcomingDays === 0 
                                ? "Due today"
                                : upcomingDays === 1
                                ? "Due tomorrow" 
                                : `${upcomingDays} days remaining`
                            )}
                          </p>
                        </div>
                        <svg
                          className="w-4 h-4 text-[#262522] shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    );
                  })}
                  {upcomingContacts.length > 5 && (
                    <button
                      onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                      className="w-full text-center py-2 text-sm text-[#0ba95b] hover:text-[#0ba95b]/80 transition-colors border-t border-gray-200 mt-3 pt-3"
                    >
                      {showAllUpcoming ? 
                        `Show less (${upcomingContacts.length - 5} hidden)` : 
                        `Show ${upcomingContacts.length - 5} more`}
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full max-w-96" style={{
            boxShadow: "8px 8px 0px #7b5ea7"
          }}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with managing your contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/contacts/add">
                <Button className="w-full">Add New Contact</Button>
              </Link>
              <Link href="/contacts">
                <Button variant="outline" className="w-full">
                  View All Contacts
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline" className="w-full">
                  View Full Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {GuestService.isGuestMode() && (
            <Card className="w-full max-w-96" style={{
              boxShadow: "8px 8px 0px #f38ba3"
            }}>
              <CardHeader>
                <CardTitle className="text-[#f38ba3]">Ready to get started?</CardTitle>
                <CardDescription>
                  Create a real account to save your contacts and access all features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/signup">
                  <Button className="w-full bg-[#f38ba3] hover:bg-[#f38ba3]/90">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full border-[#f38ba3] text-[#f38ba3] hover:bg-[#f38ba3]/10">
                    Sign In
                  </Button>
                </Link>
                <p className="text-xs text-[#262522] text-center">
                  Your data is not being saved in guest mode
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
