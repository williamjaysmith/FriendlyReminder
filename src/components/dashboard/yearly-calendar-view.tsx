"use client";

import { useState, useMemo } from "react";
import { Contact } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Modal from "@/components/ui/Modal";

interface YearlyCalendarViewProps {
  contacts: Contact[];
  onContactClick?: (contact: Contact) => void;
}

interface CalendarEvent {
  contact: Contact;
  type: 'birthday' | 'reminder';
  date: Date;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function YearlyCalendarView({ contacts, onContactClick }: YearlyCalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Calculate all future reminders for the next 2 years
  const calculateFutureReminders = (contact: Contact, yearsAhead: number = 2) => {
    const reminders: Date[] = [];
    
    // Start from the next reminder date if it exists, otherwise calculate from last conversation
    let nextReminder: Date;
    if (contact.next_reminder) {
      nextReminder = new Date(contact.next_reminder);
    } else if (contact.last_conversation) {
      const lastConv = new Date(contact.last_conversation);
      nextReminder = new Date(lastConv);
      nextReminder.setDate(nextReminder.getDate() + contact.reminder_days);
    } else {
      // If no conversation history, start from today
      nextReminder = new Date();
      nextReminder.setDate(nextReminder.getDate() + contact.reminder_days);
    }
    
    // Generate reminders for the specified years ahead
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + yearsAhead);
    
    // Make sure we don't create infinite loops
    let iterations = 0;
    const maxIterations = 1000; // Safety limit
    
    while (nextReminder <= endDate && iterations < maxIterations) {
      reminders.push(new Date(nextReminder));
      nextReminder.setDate(nextReminder.getDate() + contact.reminder_days);
      iterations++;
    }
    
    console.log(`Contact ${contact.name}: Generated ${reminders.length} future reminders`);
    
    return reminders;
  };

  // Get all events for the current year
  const yearlyEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    
    contacts.forEach(contact => {
      // Add future reminder events
      const futureReminders = calculateFutureReminders(contact);
      futureReminders.forEach(reminderDate => {
        if (reminderDate >= yearStart && reminderDate <= yearEnd) {
          events.push({
            contact,
            type: 'reminder',
            date: reminderDate
          });
        }
      });
      
      // Add birthday events
      if (contact.birthday && contact.birthday_reminder) {
        try {
          const [, month, day] = contact.birthday.split('-');
          const birthdayThisYear = new Date(currentYear, parseInt(month) - 1, parseInt(day));
          
          events.push({
            contact,
            type: 'birthday',
            date: birthdayThisYear
          });
        } catch (error) {
          console.error('Error parsing birthday:', error);
        }
      }
    });
    
    return events;
  }, [contacts, currentYear]);
  
  // Group events by month
  const eventsByMonth = useMemo(() => {
    const grouped: { [month: number]: CalendarEvent[] } = {};
    
    for (let i = 0; i < 12; i++) {
      grouped[i] = [];
    }
    
    yearlyEvents.forEach(event => {
      const month = event.date.getMonth();
      grouped[month].push(event);
    });
    
    return grouped;
  }, [yearlyEvents]);

  // Group events by date for detailed view
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    yearlyEvents.forEach(event => {
      const dateKey = event.date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  }, [yearlyEvents]);
  
  // Generate calendar grid for a specific month
  const generateMonthGrid = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };
  
  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear(currentYear + (direction === 'next' ? 1 : -1));
  };
  
  const isCurrentMonth = (date: Date, month: number) => date.getMonth() === month;
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const getEventsForDate = (date: Date) => {
    return eventsByDate[date.toDateString()] || [];
  };

  const handleDateClick = (date: Date, events: CalendarEvent[]) => {
    if (events.length > 0) {
      setSelectedDate(date);
      setShowModal(true);
    }
  };


  const formatDateForModal = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getMonthSummary = (month: number) => {
    const events = eventsByMonth[month];
    const reminderCount = events.filter(e => e.type === 'reminder').length;
    const birthdayCount = events.filter(e => e.type === 'birthday').length;
    
    if (reminderCount + birthdayCount === 0) return '';
    
    const parts = [];
    if (reminderCount > 0) parts.push(`${reminderCount} reminder${reminderCount > 1 ? 's' : ''}`);
    if (birthdayCount > 0) parts.push(`${birthdayCount} birthday${birthdayCount > 1 ? 's' : ''}`);
    
    return parts.join(', ');
  };
  
  return (
    <>
      <Card className="w-full bg-transparent border-2 border-[#4a453f]" style={{ boxShadow: "8px 8px 0px #7b5ea7" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#f9f4da] text-xl">Yearly Calendar - {currentYear}</CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateYear('prev')}
                className="p-2 hover:bg-gray-700/10 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-lg font-medium text-[#10b981] min-w-[60px] text-center">
                {currentYear}
              </span>
              <button
                onClick={() => navigateYear('next')}
                className="p-2 hover:bg-gray-700/10 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <CardDescription className="text-[#f38ba3] text-sm">
            View all reach-out reminders and birthdays for the entire year
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MONTHS.map((monthName, monthIndex) => {
              const currentMonth = new Date().getMonth();
              const currentYearActual = new Date().getFullYear();
              
              // Skip past months in the current year
              if (currentYear === currentYearActual && monthIndex < currentMonth) {
                return null;
              }
              
              const monthGrid = generateMonthGrid(currentYear, monthIndex);
              const monthSummary = getMonthSummary(monthIndex);
              
              return (
                <div key={monthIndex} className="rounded-lg p-3 border" style={{ backgroundColor: '#f9f4da', borderColor: 'rgba(0,0,0,0.12)', boxShadow: '4px 4px 0px #f38ba3' }}>
                  <div className="text-center mb-2">
                    <h3 className="font-semibold text-sm text-[#231f20]">{monthName}</h3>
                    {monthSummary && (
                      <p className="text-xs text-brand-purple mt-1">{monthSummary}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="h-6 w-6 p-0.5 text-center text-xs font-medium text-[#262522] flex items-center justify-center">
                        {day.slice(0, 1)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-0.5">
                    {monthGrid.map((date, index) => {
                      const events = getEventsForDate(date);
                      const isCurrentMonthDate = isCurrentMonth(date, monthIndex);
                      const isTodayDate = isToday(date);
                      
                      return (
                        <div
                          key={index}
                          className={`
                            h-6 w-6 p-0.5 border rounded cursor-pointer transition-colors relative flex items-center justify-center text-xs
                            ${isCurrentMonthDate 
                              ? 'bg-white border-gray-200 hover:bg-gray-50 text-[#231f20]' 
                              : 'bg-gray-50 border-gray-100 text-gray-400'
                            }
                            ${isTodayDate ? 'ring-1 ring-blue-500' : ''}
                            ${events.length > 0 && isCurrentMonthDate ? 'hover:bg-blue-50' : ''}
                          `}
                          onClick={() => handleDateClick(date, events)}
                        >
                          {/* Circle behind day number for events */}
                          {isCurrentMonthDate && events.length > 0 && (
                            <div className={`absolute inset-0 rounded-full opacity-20 ${
                              events.some(e => e.type === 'birthday') ? 'bg-[#7b5ea7]' : 'bg-[#12b5e5]'
                            }`} />
                          )}
                          <span className="relative z-10 font-medium">
                            {date.getDate()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal for date details */}
      {showModal && selectedDate && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={formatDateForModal(selectedDate)}
        >
          <div className="space-y-4">
            {getEventsForDate(selectedDate).map((event, index) => (
              <div
                key={`${event.contact.id}-${event.type}-${index}`}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  onContactClick?.(event.contact);
                  setShowModal(false);
                }}
              >
                <div className="flex-shrink-0">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: event.type === 'birthday' ? '#0ba95b' : '#f38ba3',
                      color: '#f9f4da'
                    }}
                  >
                    {event.type === 'birthday' ? '🎂' : (
                      <span className="text-sm font-medium">
                        {event.contact.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {event.contact.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {event.type === 'birthday' 
                      ? 'Birthday' 
                      : `Reminder to reach out (every ${event.contact.reminder_days} days)`
                    }
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400"
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
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}