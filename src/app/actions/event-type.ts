"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

const AvailabilityRuleSchema = z.object({
  day: z.number().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

const EventTypeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  duration: z.coerce.number().min(5).max(480),
  availability: z.object({
    rules: z.array(AvailabilityRuleSchema).min(1, "At least one availability rule is required"),
  }),
});

export async function createEventTypeAction(formData: FormData) {
  const userId = await getCurrentUserId();

  // Parse availability rules from form data
  // They come as JSON string from the client
  let availability;
  try {
    availability = JSON.parse(formData.get("availability") as string);
  } catch {
    return { error: "Invalid availability data" };
  }

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    duration: formData.get("duration"),
    availability,
  };

  const parsed = EventTypeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.eventType.create({
      data: {
        userId,
        title: parsed.data.title,
        slug: parsed.data.slug,
        duration: parsed.data.duration,
        availability: parsed.data.availability,
      },
    });
  } catch (error: unknown) {
    console.error("Create event type error:", error);
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { error: "You already have an event type with this slug." };
    }
    return {
      error:
        error instanceof Error
          ? `Failed to create event type: ${error.message}`
          : "Failed to create event type.",
    };
  }

  redirect("/dashboard");
}

export async function deleteEventTypeAction(eventTypeId: string) {
  const userId = await getCurrentUserId();

  await prisma.eventType.delete({
    where: {
      id: eventTypeId,
      userId, // ensure user owns this event type
    },
  });

  redirect("/dashboard");
}
