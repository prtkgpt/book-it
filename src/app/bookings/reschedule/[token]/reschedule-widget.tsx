"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { rescheduleBookingAction } from "@/app/actions/reschedule";

interface TimeSlot {
  start: string;
  end: string;
}

interface RescheduleWidgetProps {
  rescheduleToken: string;
  eventTypeId: string;
  hostTimezone: string;
  duration: number;
  inviteeName: string;
  inviteeEmail: string;
}

export function RescheduleWidget({
  rescheduleToken,
  eventTypeId,
  hostTimezone,
  duration,
  inviteeName,
  inviteeEmail,
}: RescheduleWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const inviteeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    async function fetchSlots() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/slots?eventTypeId=${eventTypeId}&date=${selectedDate}`
        );
        const data = await res.json();
        setSlots(data.slots || []);
      } catch {
        setError("Failed to load available times.");
      }
      setLoading(false);
    }
    fetchSlots();
  }, [eventTypeId, selectedDate]);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(startOfDay(new Date()), i);
    return format(d, "yyyy-MM-dd");
  });

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
      <div className="text-center py-12">
        <div className="text-4xl mb-4">&#10003;</div>
        <h2 className="text-xl font-bold mb-2">Rescheduled!</h2>
        <p className="text-gray-600">
          Your booking has been moved. Check your email for updated details.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Date picker */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Select a new date
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => {
            const d = new Date(date + "T12:00:00");
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg border text-sm ${
                  isSelected
                    ? "bg-black text-white border-black"
                    : "hover:border-gray-400"
                }`}
              >
                <span className="text-xs">{format(d, "EEE")}</span>
                <span className="font-medium">{format(d, "d")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Time slots */}
      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Available times
        </h2>

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}

        {!loading && slots.length === 0 && (
          <p className="text-gray-500 text-sm py-8 text-center border border-dashed rounded-lg">
            No available times on this date.
          </p>
        )}

        {!loading && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.start}
                onClick={() => handleReschedule(slot)}
                className="border rounded-md py-2 px-3 text-sm hover:border-black hover:bg-gray-50 transition-colors"
              >
                {format(new Date(slot.start), "h:mm a")}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
