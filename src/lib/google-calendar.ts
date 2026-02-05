import { google } from "googleapis";
import { prisma } from "./prisma";
import type { BusyInterval } from "./availability";

function getRedirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`
  );
}

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri()
  );
}

/**
 * Generate the Google OAuth consent URL.
 * We request calendar read + write scopes.
 */
export function getGoogleAuthUrl(state: string): string {
  return getOAuth2Client().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    state,
  });
}

/**
 * Exchange authorization code for tokens and save to DB.
 */
export async function handleGoogleCallback(
  code: string,
  userId: string
): Promise<void> {
  const { tokens } = await getOAuth2Client().getToken(code);

  await prisma.calendarAccount.upsert({
    where: { userId },
    create: {
      userId,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: new Date(tokens.expiry_date!),
    },
    update: {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || undefined,
      expiresAt: new Date(tokens.expiry_date!),
    },
  });
}

/**
 * Get an authenticated Google Calendar client for a user.
 * Handles token refresh automatically.
 */
async function getCalendarClient(userId: string) {
  const account = await prisma.calendarAccount.findUnique({
    where: { userId },
  });

  if (!account) {
    throw new Error("No Google Calendar connected. Please connect first.");
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    expiry_date: account.expiresAt.getTime(),
  });

  // Listen for token refresh events and persist new tokens
  client.on("tokens", async (tokens) => {
    await prisma.calendarAccount.update({
      where: { userId },
      data: {
        accessToken: tokens.access_token ?? account.accessToken,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : account.expiresAt,
      },
    });
  });

  return google.calendar({ version: "v3", auth: client });
}

/**
 * Fetch busy times from Google Calendar for a date range.
 */
export async function getBusyTimes(
  userId: string,
  timeMin: Date,
  timeMax: Date
): Promise<BusyInterval[]> {
  const calendar = await getCalendarClient(userId);

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: "primary" }],
    },
  });

  const busySlots = response.data.calendars?.primary?.busy || [];

  return busySlots
    .filter((b) => b.start && b.end)
    .map((b) => ({
      start: new Date(b.start!),
      end: new Date(b.end!),
    }));
}

/**
 * Create a Google Calendar event for a booking.
 */
export async function createCalendarEvent(
  userId: string,
  {
    summary,
    description,
    startTime,
    endTime,
    attendeeEmail,
    hostTimezone,
  }: {
    summary: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendeeEmail: string;
    hostTimezone: string;
  }
): Promise<string> {
  const calendar = await getCalendarClient(userId);

  const event = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: "all",
    requestBody: {
      summary,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: hostTimezone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: hostTimezone,
      },
      attendees: [{ email: attendeeEmail }],
    },
  });

  return event.data.id!;
}

/**
 * Delete a Google Calendar event (for cancellations).
 */
export async function deleteCalendarEvent(
  userId: string,
  googleEventId: string
): Promise<void> {
  const calendar = await getCalendarClient(userId);

  await calendar.events.delete({
    calendarId: "primary",
    eventId: googleEventId,
    sendUpdates: "all",
  });
}
