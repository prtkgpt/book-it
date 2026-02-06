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
      eventTypes: { orderBy: { createdAt: "desc" } },
      calendarAccount: true,
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-12 text-center">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Welcome to Book It</h1>
            <p className="text-text-secondary mb-8">Set up your account to start accepting bookings.</p>
            <Link href="/setup" className="inline-flex bg-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-primary-hover">
              Set up account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isGoogleConnected = !!user.calendarAccount;

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-text">
            book<span className="text-primary">it</span>
          </Link>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-text">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="text-text-secondary mt-1">Manage your event types and bookings.</p>
        </div>

        {/* Google Calendar status */}
        {!isGoogleConnected ? (
          <div className="bg-white rounded-2xl border border-border p-6 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text text-sm">Connect Google Calendar</p>
                <p className="text-text-secondary text-sm">Avoid conflicts and create events automatically.</p>
              </div>
            </div>
            <a href="/api/google/connect" className="flex-shrink-0 bg-primary text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-primary-hover">
              Connect
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border p-4 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">Google Calendar connected</p>
          </div>
        )}

        {/* Event Types */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Event Types</h2>
            <Link href="/dashboard/event-types/new" className="bg-primary text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-primary-hover">
              + New Event Type
            </Link>
          </div>

          {user.eventTypes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border-hover p-12 text-center">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-text-secondary text-sm">No event types yet. Create your first one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.eventTypes.map((et) => {
                const bookingPath = `/meet/${user.handle}/${et.slug}`;
                return (
                  <div key={et.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-10 bg-primary rounded-full mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-text">{et.title}</h3>
                          <p className="text-sm text-text-secondary mt-0.5">{et.duration} min</p>
                          <p className="text-xs text-text-muted mt-2 font-mono">/meet/{user.handle}/{et.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CopyLinkButton path={bookingPath} />
                        <form action={async () => { "use server"; await deleteEventTypeAction(et.id); }}>
                          <button type="submit" className="text-xs text-text-muted hover:text-accent px-3 py-1.5 rounded-full border border-border hover:border-accent">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <UpcomingBookings userId={userId} />
      </div>
    </div>
  );
}

async function UpcomingBookings({ userId }: { userId: string }) {
  const bookings = await prisma.booking.findMany({
    where: { userId, status: "CONFIRMED", startTime: { gte: new Date() } },
    include: { eventType: true },
    orderBy: { startTime: "asc" },
    take: 10,
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-text mb-4">Upcoming Bookings</h2>
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-border-hover p-12 text-center">
          <p className="text-text-secondary text-sm">No upcoming bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary leading-none">
                    {b.startTime.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                  </span>
                  <span className="text-lg font-bold text-primary leading-none mt-0.5">
                    {b.startTime.getDate()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-text">{b.eventType.title}</h3>
                  <p className="text-sm text-text-secondary mt-0.5">
                    {b.inviteeName} &middot; {b.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-text-muted mt-1">{b.inviteeEmail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
