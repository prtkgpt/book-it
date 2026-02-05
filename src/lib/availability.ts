import {
  startOfDay,
  endOfDay,
  addMinutes,
  isBefore,
  isAfter,
  areIntervalsOverlapping,
  format,
  parse,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

// Shape of availability rules stored in EventType.availability JSON
export interface AvailabilityRule {
  day: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface AvailabilityConfig {
  rules: AvailabilityRule[];
}

export interface TimeSlot {
  start: Date; // UTC
  end: Date; // UTC
}

export interface BusyInterval {
  start: Date;
  end: Date;
}

/**
 * Compute available time slots for a given date range.
 *
 * 1. For each day in the range, check availability rules (in the host's timezone)
 * 2. Generate candidate slots based on event duration
 * 3. Remove slots that overlap with busy times (from Google Calendar + existing bookings)
 * 4. Remove slots in the past
 */
export function getAvailableSlots({
  dateRangeStart,
  dateRangeEnd,
  availabilityConfig,
  durationMinutes,
  busyIntervals,
  hostTimezone,
}: {
  dateRangeStart: Date;
  dateRangeEnd: Date;
  availabilityConfig: AvailabilityConfig;
  durationMinutes: number;
  busyIntervals: BusyInterval[];
  hostTimezone: string;
}): TimeSlot[] {
  const now = new Date();
  const slots: TimeSlot[] = [];

  // Get each day in the range (in host timezone)
  const startInTz = toZonedTime(dateRangeStart, hostTimezone);
  const endInTz = toZonedTime(dateRangeEnd, hostTimezone);

  const days = eachDayOfInterval({
    start: startOfDay(startInTz),
    end: startOfDay(endInTz),
  });

  for (const day of days) {
    const dayOfWeek = getDay(day);

    // Find rules that apply to this day of week
    const rulesForDay = availabilityConfig.rules.filter(
      (r) => r.day === dayOfWeek
    );

    for (const rule of rulesForDay) {
      // Parse start/end times in the host's timezone for this specific day
      const windowStartLocal = parse(rule.start, "HH:mm", day);
      const windowEndLocal = parse(rule.end, "HH:mm", day);

      // Convert to UTC
      const windowStartUtc = fromZonedTime(windowStartLocal, hostTimezone);
      const windowEndUtc = fromZonedTime(windowEndLocal, hostTimezone);

      // Generate slots within this availability window
      let slotStart = windowStartUtc;
      while (true) {
        const slotEnd = addMinutes(slotStart, durationMinutes);

        // Stop if slot extends beyond window
        if (isAfter(slotEnd, windowEndUtc)) break;

        // Skip slots in the past (with 15-min buffer so invitees can't book too last-minute)
        const bufferTime = addMinutes(now, 15);
        if (isBefore(slotStart, bufferTime)) {
          slotStart = addMinutes(slotStart, durationMinutes);
          continue;
        }

        // Check for conflicts with busy times
        const hasConflict = busyIntervals.some((busy) =>
          areIntervalsOverlapping(
            { start: slotStart, end: slotEnd },
            { start: busy.start, end: busy.end }
          )
        );

        if (!hasConflict) {
          slots.push({ start: slotStart, end: slotEnd });
        }

        slotStart = addMinutes(slotStart, durationMinutes);
      }
    }
  }

  return slots;
}

/**
 * Format a slot for display in a specific timezone.
 */
export function formatSlotForDisplay(
  slot: TimeSlot,
  timezone: string
): { date: string; time: string } {
  const startInTz = toZonedTime(slot.start, timezone);
  return {
    date: format(startInTz, "EEEE, MMMM d, yyyy"),
    time: format(startInTz, "h:mm a"),
  };
}
