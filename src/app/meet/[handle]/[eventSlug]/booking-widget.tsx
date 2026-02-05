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
import { bookSlotAction } from "@/app/actions/booking";

interface TimeSlot {
  start: string;
  end: string;
}

interface BookingWidgetProps {
  eventTypeId: string;
  hostName: string;
  hostTimezone: string;
  eventTitle: string;
  duration: number;
}

export function BookingWidget({
  eventTypeId,
  hostName,
  hostTimezone,
  eventTitle,
  duration,
}: BookingWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");
  const [error, setError] = useState<string | null>(null);

  const inviteeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch slots when a date is selected
  useEffect(() => {
    if (!selectedDate) return;
    async function fetchSlots() {
      setLoading(true);
      setError(null);
      try {
        const dateStr = format(selectedDate!, "yyyy-MM-dd");
        const res = await fetch(
          `/api/slots?eventTypeId=${eventTypeId}&date=${dateStr}`
        );
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setSlots(data.slots || []);
        }
      } catch {
        setError("Failed to load available times.");
      }
      setLoading(false);
    }
    fetchSlots();
  }, [eventTypeId, selectedDate]);

  async function handleBooking(formData: FormData) {
    if (!selectedSlot) return;
    formData.set("eventTypeId", eventTypeId);
    formData.set("startTime", selectedSlot.start);
    formData.set("endTime", selectedSlot.end);
    formData.set("timezone", inviteeTimezone);

    const result = await bookSlotAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setStep("done");
    }
  }

  // --- DONE STEP ---
  if (step === "done") {
    return (
      <div className="flex items-center justify-center py-20 px-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">You are scheduled</h2>
          <p className="text-text-secondary leading-relaxed">
            A calendar invitation has been sent to your email address.
          </p>
        </div>
      </div>
    );
  }

  // --- CONFIRM STEP ---
  if (step === "confirm" && selectedSlot) {
    const slotStart = new Date(selectedSlot.start);
    return (
      <div className="flex flex-col sm:flex-row min-h-[500px]">
        {/* Left panel — event details */}
        <div className="sm:w-72 border-b sm:border-b-0 sm:border-r border-border p-8 flex-shrink-0">
          <button
            type="button"
            onClick={() => { setStep("select"); setError(null); }}
            className="inline-flex items-center text-sm text-text-secondary hover:text-text mb-6"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <p className="text-sm text-text-secondary mb-1">{hostName}</p>
          <h2 className="text-xl font-bold text-text mb-4">{eventTitle}</h2>
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {duration} min
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(slotStart, "h:mm a, EEEE, MMMM d, yyyy")}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
              {inviteeTimezone}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 p-8">
          <h3 className="text-lg font-semibold text-text mb-6">Enter Details</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <form action={handleBooking} className="space-y-5">
            <div>
              <label htmlFor="inviteeName" className="block text-sm font-medium text-text mb-1.5">
                Name *
              </label>
              <input
                id="inviteeName"
                name="inviteeName"
                type="text"
                required
                className="w-full border border-border rounded-xl px-4 py-3 text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="inviteeEmail" className="block text-sm font-medium text-text mb-1.5">
                Email *
              </label>
              <input
                id="inviteeEmail"
                name="inviteeEmail"
                type="email"
                required
                className="w-full border border-border rounded-xl px-4 py-3 text-sm"
                placeholder="john@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-full hover:bg-primary-hover text-sm"
            >
              Schedule Event
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- SELECT STEP: Calendar + Time Slots ---
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0=Sun
  const today = startOfDay(new Date());

  return (
    <div className="flex flex-col sm:flex-row min-h-[500px]">
      {/* Left panel — event info */}
      <div className="sm:w-72 border-b sm:border-b-0 sm:border-r border-border p-8 flex-shrink-0">
        <p className="text-sm text-text-secondary mb-1">{hostName}</p>
        <h2 className="text-xl font-bold text-text mb-4">{eventTitle}</h2>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {duration} min
        </div>
      </div>

      {/* Center panel — Calendar grid */}
      <div className="flex-1 p-6 sm:p-8 border-b sm:border-b-0 sm:border-r border-border">
        <h3 className="text-sm font-semibold text-text mb-5">Select a Date &amp; Time</h3>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-full hover:bg-muted text-text-secondary hover:text-text"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-text">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-full hover:bg-muted text-text-secondary hover:text-text"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 mb-1">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-text-muted py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {calendarDays.map((day) => {
            const isPast = isBefore(day, today);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const todayMark = isToday(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isPast}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square flex items-center justify-center text-sm rounded-full m-0.5
                  ${isPast
                    ? "text-text-muted cursor-not-allowed"
                    : selected
                    ? "bg-primary text-white font-semibold"
                    : todayMark
                    ? "font-semibold text-primary hover:bg-primary-light"
                    : "text-text hover:bg-muted font-medium"
                  }
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-text-muted mt-4">
          Timezone: {inviteeTimezone}
        </p>
      </div>

      {/* Right panel — Time slots (only visible when date selected) */}
      {selectedDate && (
        <div className="sm:w-52 p-6 sm:p-4 overflow-y-auto max-h-[500px] flex-shrink-0">
          <p className="text-sm font-semibold text-text mb-3">
            {format(selectedDate, "EEE, MMM d")}
          </p>

          {loading && (
            <div className="space-y-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-11 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <p className="text-error text-xs">{error}</p>
          )}

          {!loading && !error && slots.length === 0 && (
            <p className="text-text-muted text-sm py-4">
              No times available
            </p>
          )}

          {!loading && slots.length > 0 && (
            <div className="space-y-2">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => {
                    setSelectedSlot(slot);
                    setStep("confirm");
                  }}
                  className="w-full py-2.5 px-3 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
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
