export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { deleteEventTypeAction } from "@/app/actions/event-type";
import { CopyLinkButton } from "./copy-link-button";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      eventTypes: {
        orderBy: { createdAt: "desc" },
      },
      calendarAccount: true,
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Welcome to Book It</h1>
        <p className="text-gray-600 mb-4">
          No user profile found. Please set up your account first.
        </p>
        <Link
          href="/setup"
          className="inline-block bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Set up account
        </Link>
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isGoogleConnected = !!user.calendarAccount;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.name}</p>
        </div>
      </div>

      {/* Google Calendar connection status */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="font-semibold mb-2">Google Calendar</h2>
        {isGoogleConnected ? (
          <p className="text-green-700">Connected</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Connect your Google Calendar to check for conflicts and create events.
            </p>
            <a
              href="/api/google/connect"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Connect Google Calendar
            </a>
          </div>
        )}
      </div>

      {/* Event Types */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Event Types</h2>
          <Link
            href="/dashboard/event-types/new"
            className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800"
          >
            New Event Type
          </Link>
        </div>

        {user.eventTypes.length === 0 ? (
          <p className="text-gray-500 py-8 text-center border border-dashed rounded-lg">
            No event types yet. Create one to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {user.eventTypes.map((et) => {
              const bookingUrl = `${appUrl}/meet/${user.handle}/${et.slug}`;
              return (
                <div
                  key={et.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{et.title}</h3>
                    <p className="text-sm text-gray-500">{et.duration} min</p>
                    <p className="text-sm text-blue-600 mt-1">{bookingUrl}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyLinkButton url={bookingUrl} />
                    <form
                      action={async () => {
                        "use server";
                        await deleteEventTypeAction(et.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Bookings */}
      <UpcomingBookings userId={userId} />
    </div>
  );
}

async function UpcomingBookings({ userId }: { userId: string }) {
  const bookings = await prisma.booking.findMany({
    where: {
      userId,
      status: "CONFIRMED",
      startTime: { gte: new Date() },
    },
    include: { eventType: true },
    orderBy: { startTime: "asc" },
    take: 10,
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500 py-8 text-center border border-dashed rounded-lg">
          No upcoming bookings.
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="p-4 border rounded-lg">
              <h3 className="font-medium">{b.eventType.title}</h3>
              <p className="text-sm text-gray-600">
                {b.inviteeName} ({b.inviteeEmail})
              </p>
              <p className="text-sm text-gray-500">
                {b.startTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                at{" "}
                {b.startTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
