"use server";

import { prisma } from "@/lib/prisma";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/google-calendar";
import { sendBookingConfirmationEmails } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Reschedule a booking:
 * 1. Mark old booking as RESCHEDULED
 * 2. Create a new booking with the new time
 * 3. Delete old Google Calendar event, create new one
 * 4. Send new confirmation emails
 */
export async function rescheduleBookingAction({
  rescheduleToken,
  newStartTime,
  newEndTime,
  timezone,
}: {
  rescheduleToken: string;
  newStartTime: string;
  newEndTime: string;
  timezone: string;
}) {
  const oldBooking = await prisma.booking.findUnique({
    where: { rescheduleToken },
    include: { eventType: { include: { user: true } } },
  });

  if (!oldBooking) {
    return { error: "Invalid reschedule link." };
  }

  if (oldBooking.status !== "CONFIRMED") {
    return { error: "This booking has already been cancelled or rescheduled." };
  }

  const start = new Date(newStartTime);
  const end = new Date(newEndTime);

  // Check for conflicts with the new time
  const conflict = await prisma.booking.findFirst({
    where: {
      eventTypeId: oldBooking.eventTypeId,
      status: "CONFIRMED",
      id: { not: oldBooking.id },
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (conflict) {
    return { error: "This time slot is no longer available." };
  }

  // Mark old booking as rescheduled
  await prisma.booking.update({
    where: { id: oldBooking.id },
    data: { status: "RESCHEDULED" },
  });

  // Delete old Google Calendar event
  if (oldBooking.googleEventId) {
    try {
      await deleteCalendarEvent(oldBooking.userId, oldBooking.googleEventId);
    } catch (error) {
      console.error("Failed to delete old calendar event:", error);
    }
  }

  // Create new booking
  const newBooking = await prisma.booking.create({
    data: {
      eventTypeId: oldBooking.eventTypeId,
      userId: oldBooking.userId,
      inviteeName: oldBooking.inviteeName,
      inviteeEmail: oldBooking.inviteeEmail,
      startTime: start,
      endTime: end,
      timezone,
    },
  });

  // Create new Google Calendar event
  try {
    const user = oldBooking.eventType.user;
    const googleEventId = await createCalendarEvent(user.id, {
      summary: `${oldBooking.eventType.title} - ${oldBooking.inviteeName}`,
      description: `Rescheduled via Book It\nInvitee: ${oldBooking.inviteeName} (${oldBooking.inviteeEmail})`,
      startTime: start,
      endTime: end,
      attendeeEmail: oldBooking.inviteeEmail,
      hostTimezone: user.timezone,
    });

    await prisma.booking.update({
      where: { id: newBooking.id },
      data: { googleEventId },
    });
  } catch (error) {
    console.error("Failed to create new calendar event:", error);
  }

  // Send new confirmation emails
  try {
    const user = oldBooking.eventType.user;
    await sendBookingConfirmationEmails({
      hostName: user.name,
      hostEmail: user.email,
      inviteeName: oldBooking.inviteeName,
      inviteeEmail: oldBooking.inviteeEmail,
      eventTitle: oldBooking.eventType.title,
      startTime: start,
      endTime: end,
      timezone,
      cancelUrl: `${APP_URL}/bookings/cancel/${newBooking.cancelToken}`,
      rescheduleUrl: `${APP_URL}/bookings/reschedule/${newBooking.rescheduleToken}`,
    });
  } catch (error) {
    console.error("Failed to send reschedule confirmation emails:", error);
  }

  return { success: true };
}
