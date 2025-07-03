"use client";

import { useState, useMemo } from "react";
import { Contact } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Modal from "@/components/ui/Modal";

interface CalendarViewProps {
  contacts: Contact[];
  onContactClick?: (contact: Contact) => void;
}

interface CalendarEvent {
  contact: Contact;
  type: "birthday" | "reminder";
  date: Date;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarView({ contacts, onContactClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calculate future reminders for a contact within the current month
  const calculateMonthReminders = (contact: Contact) => {
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

    // Generate reminders for the current month
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    // Look ahead up to 6 months to catch reminders that fall in the current month
    const lookAheadEnd = new Date();
    lookAheadEnd.setMonth(lookAheadEnd.getMonth() + 6);

    let iterations = 0;
    const maxIterations = 50; // Safety limit for single month

    while (nextReminder <= lookAheadEnd && iterations < maxIterations) {
      if (nextReminder >= monthStart && nextReminder <= monthEnd) {
        reminders.push(new Date(nextReminder));
      }
      nextReminder.setDate(nextReminder.getDate() + contact.reminder_days);
      iterations++;
    }

    console.log(
      `Dashboard calendar - Contact ${contact.name}: Generated ${reminders.length} reminders for current month`,
    );
    return reminders;
  };

  // Get events for the current month
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    contacts.forEach((contact) => {
      // Add future reminder events for the current month
      const monthReminders = calculateMonthReminders(contact);
      monthReminders.forEach((reminderDate) => {
        events.push({
          contact,
          type: "reminder",
          date: reminderDate,
        });
      });

      // Add birthday events
      if (contact.birthday && contact.birthday_reminder) {
        try {
          const [, month, day] = contact.birthday.split("-");
          const birthdayThisYear = new Date(
            currentYear,
            parseInt(month) - 1,
            parseInt(day),
          );

          if (birthdayThisYear.getMonth() === currentMonth) {
            events.push({
              contact,
              type: "birthday",
              date: birthdayThisYear,
            });
          }
        } catch (error) {
          console.error("Error parsing birthday:", error);
        }
      }
    });

    return events;
  }, [contacts, currentMonth, currentYear]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};

    calendarEvents.forEach((event) => {
      const dateKey = event.date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [calendarEvents]);

  // Generate calendar grid - only current month dates
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    // const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Calculate how many empty cells we need at the beginning
    const startPadding = firstDay.getDay();

    const days = [];

    // Add empty cells for padding at the beginning
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add all days of the current month
    const current = new Date(firstDay);
    while (current.getMonth() === currentMonth) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Add empty cells at the end to complete the grid (if needed)
    while (days.length < 42) {
      days.push(null);
    }

    return days;
  }, [currentMonth, currentYear]);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

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

  const handleMouseEnter = (
    date: Date,
    events: CalendarEvent[],
    e: React.MouseEvent,
  ) => {
    if (events.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setHoveredDate(date);
    }
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  // Helper for tooltip content if needed later
  // const getEventTooltip = (events: CalendarEvent[]) => {
  //   if (events.length === 0) return '';
  //
  //   const eventDescriptions = events.map(event => {
  //     const eventType = event.type === 'birthday' ? 'Birthday' : 'Reminder';
  //     return `${event.contact.name} - ${eventType}`;
  //   });
  //
  //   return eventDescriptions.join(', ');
  // };

  const formatDateForModal = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Card
        className="w-full max-w-96"
        style={{ backgroundColor: "#f9f4da", boxShadow: "8px 8px 0px #7b5ea7" }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#231f20] text-lg">Calendar</CardTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-1 hover:bg-[#f9f4da] hover:brightness-95 rounded transition-colors"
              >
                <svg
                  className="w-3 h-3 text-[#231f20]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-sm font-medium text-[#231f20] min-w-[80px] text-center">
                {MONTHS[currentMonth].slice(0, 3)} {currentYear}
              </span>
              <button
                onClick={() => navigateMonth("next")}
                className="p-1 hover:bg-[#f9f4da] hover:brightness-95 rounded transition-colors"
              >
                <svg
                  className="w-3 h-3 text-[#231f20]"
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
              </button>
            </div>
          </div>
          <CardDescription className="text-[#262522] text-sm">
            Click dates to see contacts & events
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="h-8 w-8 p-1 text-center text-xs font-medium text-[#262522] flex items-center justify-center"
              >
                {day.slice(0, 1)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {calendarGrid.map((date, index) => {
              if (date === null) {
                // Empty cell for padding
                return <div key={index} className="h-8 w-8 p-1" />;
              }

              const events = getEventsForDate(date);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`
                    h-8 w-8 p-1 border rounded cursor-pointer transition-colors relative flex items-center justify-center
                    bg-white border-gray-200 hover:bg-gray-50
                    ${isTodayDate ? "ring-1 ring-blue-500" : ""}
                    ${events.length > 0 ? "hover:bg-blue-50" : ""}
                  `}
                  onClick={() => handleDateClick(date, events)}
                  onMouseEnter={(e) => handleMouseEnter(date, events, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Circle behind day number for events */}
                  {events.length > 0 && (
                    <div
                      className={`absolute inset-0 rounded-full opacity-20 ${
                        events.some((e) => e.type === "birthday")
                          ? "bg-[#7b5ea7]"
                          : "bg-[#12b5e5]"
                      }`}
                    />
                  )}
                  <div className="text-xs font-medium relative z-10 text-[#231f20]">
                    {date.getDate()}
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
                      backgroundColor:
                        event.type === "birthday" ? "#0ba95b" : "#f38ba3",
                      color: "#f9f4da",
                    }}
                  >
                    {event.type === "birthday" ? (
                      "🎂"
                    ) : (
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
                    {event.type === "birthday"
                      ? "Birthday"
                      : "Reminder to reach out"}
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

      {/* Custom Tooltip */}
      {hoveredDate && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
            <div className="text-sm font-medium text-gray-900 mb-2">
              {hoveredDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="space-y-1">
              {getEventsForDate(hoveredDate).map((event, index) => (
                <div
                  key={`${event.contact.id}-${event.type}-${index}`}
                  className="flex items-center space-x-2 text-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        event.type === "birthday" ? "#0ba95b" : "#f38ba3",
                    }}
                  />
                  <span className="text-gray-700">
                    {event.contact.name} -{" "}
                    {event.type === "birthday" ? "Birthday" : "Reminder"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
