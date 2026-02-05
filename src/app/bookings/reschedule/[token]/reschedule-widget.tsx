"use client";

import { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  getDay,
} from "date-fns";
import { rescheduleBookingAction } from "@/app/actions/reschedule";

interface TimeSlot {
  start: string;
  end: string;
}

interface RescheduleWidgetProps {
  rescheduleToken: string;
  eventTypeId: string;
  hostName: string;
  hostTimezone: string;
  eventTitle: string;
  duration: number;
  inviteeName: string;
  inviteeEmail: string;
}

export function RescheduleWidget({
  rescheduleToken,
  eventTypeId,
  hostName,
  hostTimezone,
  eventTitle,
  duration,
}: RescheduleWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const inviteeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (!selectedDate) return;
    async function fetchSlots() {
      setLoading(true);
      setError(null);
      try {
        const dateStr = format(selectedDate!, "yyyy-MM-dd");
        const res = await fetch(`/api/slots?eventTypeId=${eventTypeId}&date=${dateStr}`);
        const data = await res.json();
        setSlots(data.slots || []);
      } catch {
        setError("Failed to load available times.");
      }
      setLoading(false);
    }
    fetchSlots();
  }, [eventTypeId, selectedDate]);

  async function handleReschedule(slot: TimeSlot) {
    setError(null);
    const result = await rescheduleBookingAction({
      rescheduleToken,
      newStartTime: slot.start,
      newEndTime: slot.end,
      timezone: inviteeTimezone,
    });
    if (result?.error) {
      setError(result.error);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="flex items-center justify-center py-20 px-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Rescheduled!</h2>
          <p className="text-text-secondary leading-relaxed">
            Your booking has been moved. Check your email for updated details.
          </p>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const today = startOfDay(new Date());

  return (
    <div className="flex flex-col sm:flex-row min-h-[500px]">
      {/* Left panel */}
      <div className="sm:w-72 border-b sm:border-b-0 sm:border-r border-border p-8 flex-shrink-0">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Reschedule</p>
        <p className="text-sm text-text-secondary mb-1">{hostName}</p>
        <h2 className="text-xl font-bold text-text mb-4">{eventTitle}</h2>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {duration} min
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-6 sm:p-8 border-b sm:border-b-0 sm:border-r border-border">
        <h3 className="text-sm font-semibold text-text mb-5">Select a new time</h3>

        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-full hover:bg-muted text-text-secondary hover:text-text">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-text">{format(currentMonth, "MMMM yyyy")}</span>
          <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-full hover:bg-muted text-text-secondary hover:text-text">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-text-muted py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {calendarDays.map((day) => {
            const isPast = isBefore(day, today);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const todayMark = isToday(day);
            return (
              <button key={day.toISOString()} type="button" disabled={isPast}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square flex items-center justify-center text-sm rounded-full m-0.5
                  ${isPast ? "text-text-muted cursor-not-allowed"
                    : selected ? "bg-primary text-white font-semibold"
                    : todayMark ? "font-semibold text-primary hover:bg-primary-light"
                    : "text-text hover:bg-muted font-medium"}`}>
                {format(day, "d")}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-text-muted mt-4">Timezone: {inviteeTimezone}</p>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="sm:w-52 p-6 sm:p-4 overflow-y-auto max-h-[500px] flex-shrink-0">
          <p className="text-sm font-semibold text-text mb-3">{format(selectedDate, "EEE, MMM d")}</p>

          {error && <div className="mb-3 p-2 bg-red-50 text-error rounded-lg text-xs">{error}</div>}

          {loading && (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-11 bg-muted rounded-lg animate-pulse" />)}
            </div>
          )}

          {!loading && slots.length === 0 && (
            <p className="text-text-muted text-sm py-4">No times available</p>
          )}

          {!loading && slots.length > 0 && (
            <div className="space-y-2">
              {slots.map((slot) => (
                <button key={slot.start} type="button" onClick={() => handleReschedule(slot)}
                  className="w-full py-2.5 px-3 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                  {format(new Date(slot.start), "h:mm a")}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
