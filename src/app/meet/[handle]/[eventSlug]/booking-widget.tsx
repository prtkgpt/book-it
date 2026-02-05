"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { bookSlotAction } from "@/app/actions/booking";

interface TimeSlot {
  start: string;
  end: string;
}

interface BookingWidgetProps {
  eventTypeId: string;
  hostTimezone: string;
  duration: number;
}

export function BookingWidget({
  eventTypeId,
  hostTimezone,
  duration,
}: BookingWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");
  const [error, setError] = useState<string | null>(null);

  const inviteeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch available slots when date changes
  useEffect(() => {
    async function fetchSlots() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/slots?eventTypeId=${eventTypeId}&date=${selectedDate}`
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

  // Generate next 14 days for date picker
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(startOfDay(new Date()), i);
    return format(d, "yyyy-MM-dd");
  });

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

  if (step === "done") {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">&#10003;</div>
        <h2 className="text-xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">
          A confirmation email has been sent. Check your inbox for details and
          cancel/reschedule links.
        </p>
      </div>
    );
  }

  if (step === "confirm" && selectedSlot) {
    const slotStart = new Date(selectedSlot.start);
    return (
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Confirm Your Booking</h2>
        <p className="text-gray-600 mb-1">
          {format(slotStart, "EEEE, MMMM d, yyyy")}
        </p>
        <p className="text-gray-600 mb-6">
          {format(slotStart, "h:mm a")} ({inviteeTimezone}) &middot; {duration}{" "}
          min
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form action={handleBooking} className="space-y-4">
          <div>
            <label
              htmlFor="inviteeName"
              className="block text-sm font-medium mb-1"
            >
              Your name
            </label>
            <input
              id="inviteeName"
              name="inviteeName"
              type="text"
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="inviteeEmail"
              className="block text-sm font-medium mb-1"
            >
              Your email
            </label>
            <input
              id="inviteeEmail"
              name="inviteeEmail"
              type="email"
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("select");
                setError(null);
              }}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      {/* Date picker */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Select a date</h2>
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
                <span className="text-xs">
                  {format(d, "EEE")}
                </span>
                <span className="font-medium">
                  {format(d, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Available times
        </h2>

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {!loading && !error && slots.length === 0 && (
          <p className="text-gray-500 text-sm py-8 text-center border border-dashed rounded-lg">
            No available times on this date.
          </p>
        )}

        {!loading && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.start}
                onClick={() => {
                  setSelectedSlot(slot);
                  setStep("confirm");
                }}
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
