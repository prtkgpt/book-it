"use server";

import { z } from "zod";
import { createBooking, cancelBooking } from "@/lib/booking";

const BookingSchema = z.object({
  eventTypeId: z.string(),
  inviteeName: z.string().min(1, "Name is required"),
  inviteeEmail: z.string().email("Valid email is required"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string(),
});

export async function bookSlotAction(formData: FormData) {
  const raw = {
    eventTypeId: formData.get("eventTypeId"),
    inviteeName: formData.get("inviteeName"),
    inviteeEmail: formData.get("inviteeEmail"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    timezone: formData.get("timezone"),
  };

  const parsed = BookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const booking = await createBooking({
      ...parsed.data,
      startTime: new Date(parsed.data.startTime),
      endTime: new Date(parsed.data.endTime),
    });

    return { success: true, bookingId: booking.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to book slot",
    };
  }
}

export async function cancelBookingAction(cancelToken: string) {
  try {
    await cancelBooking(cancelToken);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to cancel booking",
    };
  }
}
