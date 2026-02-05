import { prisma } from "./prisma";
import { createCalendarEvent, deleteCalendarEvent, getBusyTimes } from "./google-calendar";
import { getAvailableSlots, type BusyInterval } from "./availability";
import { sendBookingConfirmationEmails, sendCancellationEmails } from "./email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Create a new booking. This is the main booking flow:
 * 1. Validate the slot is still available (race condition guard)
 * 2. Store booking in DB
 * 3. Create Google Calendar event
 * 4. Send confirmation emails
 */
export async function createBooking({
  eventTypeId,
  inviteeName,
  inviteeEmail,
  startTime,
  endTime,
  timezone,
}: {
  eventTypeId: string;
  inviteeName: string;
  inviteeEmail: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
}) {
  // Load the event type + user
  const eventType = await prisma.eventType.findUniqueOrThrow({
    where: { id: eventTypeId },
    include: { user: true },
  });

  const user = eventType.user;

  // Double-check the slot is still available (prevents race conditions)
  const existingBooking = await prisma.booking.findFirst({
    where: {
      eventTypeId,
      status: "CONFIRMED",
      OR: [
        // Overlapping bookings
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
    },
  });

  if (existingBooking) {
    throw new Error("This time slot is no longer available. Please choose another.");
  }

  // Create the booking in DB
  const booking = await prisma.booking.create({
    data: {
      eventTypeId,
      userId: user.id,
      inviteeName,
      inviteeEmail,
      startTime,
      endTime,
      timezone,
    },
  });

  // Create Google Calendar event (non-blocking — we don't fail the booking if Calendar errors)
  try {
    const googleEventId = await createCalendarEvent(user.id, {
      summary: `${eventType.title} - ${inviteeName}`,
      description: `Booked via Book It\nInvitee: ${inviteeName} (${inviteeEmail})`,
      startTime,
      endTime,
      attendeeEmail: inviteeEmail,
      hostTimezone: user.timezone,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { googleEventId },
    });
  } catch (error) {
    console.error("Failed to create Google Calendar event:", error);
    // Booking still succeeds — calendar event is best-effort
  }

  // Send confirmation emails (non-blocking)
  try {
    await sendBookingConfirmationEmails({
      hostName: user.name,
      hostEmail: user.email,
      inviteeName,
      inviteeEmail,
      eventTitle: eventType.title,
      startTime,
      endTime,
      timezone,
      cancelUrl: `${APP_URL}/bookings/cancel/${booking.cancelToken}`,
      rescheduleUrl: `${APP_URL}/bookings/reschedule/${booking.rescheduleToken}`,
    });
  } catch (error) {
    console.error("Failed to send confirmation emails:", error);
  }

  return booking;
}

/**
 * Cancel a booking by its cancel token.
 */
export async function cancelBooking(cancelToken: string) {
  const booking = await prisma.booking.findUnique({
    where: { cancelToken },
    include: { eventType: { include: { user: true } } },
  });

  if (!booking) {
    throw new Error("Invalid cancel link.");
  }

  if (booking.status !== "CONFIRMED") {
    throw new Error("This booking has already been cancelled or rescheduled.");
  }

  // Update booking status
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
  });

  // Delete Google Calendar event
  if (booking.googleEventId) {
    try {
      await deleteCalendarEvent(booking.userId, booking.googleEventId);
    } catch (error) {
      console.error("Failed to delete Google Calendar event:", error);
    }
  }

  // Send cancellation emails
  try {
    await sendCancellationEmails({
      hostName: booking.eventType.user.name,
      hostEmail: booking.eventType.user.email,
      inviteeName: booking.inviteeName,
      inviteeEmail: booking.inviteeEmail,
      eventTitle: booking.eventType.title,
      startTime: booking.startTime,
      timezone: booking.timezone,
    });
  } catch (error) {
    console.error("Failed to send cancellation emails:", error);
  }

  return booking;
}

/**
 * Get available slots for an event type over a date range.
 * Combines Google Calendar busy times with existing bookings.
 */
export async function getAvailableSlotsForEventType(
  eventTypeId: string,
  dateRangeStart: Date,
  dateRangeEnd: Date
) {
  const eventType = await prisma.eventType.findUniqueOrThrow({
    where: { id: eventTypeId },
    include: { user: true },
  });

  // Get busy times from Google Calendar
  let googleBusy: BusyInterval[] = [];
  try {
    googleBusy = await getBusyTimes(
      eventType.userId,
      dateRangeStart,
      dateRangeEnd
    );
  } catch (error) {
    console.error("Failed to fetch Google Calendar busy times:", error);
    // Continue without Google Calendar data — availability still works from DB bookings
  }

  // Get existing confirmed bookings as busy intervals
  const existingBookings = await prisma.booking.findMany({
    where: {
      eventTypeId,
      status: "CONFIRMED",
      startTime: { gte: dateRangeStart },
      endTime: { lte: dateRangeEnd },
    },
  });

  const bookingBusy: BusyInterval[] = existingBookings.map((b) => ({
    start: b.startTime,
    end: b.endTime,
  }));

  const busyIntervals = [...googleBusy, ...bookingBusy];

  return getAvailableSlots({
    dateRangeStart,
    dateRangeEnd,
    availabilityConfig: eventType.availability as { rules: { day: number; start: string; end: string }[] },
    durationMinutes: eventType.duration,
    busyIntervals,
    hostTimezone: eventType.user.timezone,
  });
}
