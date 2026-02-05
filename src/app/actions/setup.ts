"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

const SetupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  handle: z
    .string()
    .min(1, "Handle is required")
    .regex(/^[a-z0-9-]+$/, "Handle must be lowercase alphanumeric with dashes"),
  timezone: z.string(),
});

export async function setupUserAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    handle: formData.get("handle"),
    timezone: formData.get("timezone"),
  };

  const parsed = SetupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        name: parsed.data.name,
        email: parsed.data.email,
        handle: parsed.data.handle,
        timezone: parsed.data.timezone,
      },
      update: {
        name: parsed.data.name,
        email: parsed.data.email,
        handle: parsed.data.handle,
        timezone: parsed.data.timezone,
      },
    });
  } catch (error: unknown) {
    console.error("Setup action error:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "This handle or email is already taken." };
    }
    return {
      error:
        error instanceof Error
          ? `Failed to create account: ${error.message}`
          : "Failed to create account.",
    };
  }

  redirect("/dashboard");
}
