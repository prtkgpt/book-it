import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CancelForm } from "./cancel-form";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CancelBookingPage({ params }: Props) {
  const { token } = await params;

  const booking = await prisma.booking.findUnique({
    where: { cancelToken: token },
    include: { eventType: { include: { user: true } } },
  });

  if (!booking) {
    notFound();
  }

  if (booking.status !== "CONFIRMED") {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-10 text-center max-w-sm">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-text mb-2">Already Cancelled</h1>
          <p className="text-text-secondary text-sm">This booking has already been cancelled or rescheduled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8 max-w-sm w-full">
        <h1 className="text-lg font-bold text-text mb-6">Cancel Booking</h1>

        <div className="bg-muted rounded-xl p-4 mb-6">
          <p className="font-semibold text-text text-sm">{booking.eventType.title}</p>
          <p className="text-text-secondary text-sm mt-1">with {booking.eventType.user.name}</p>
          <div className="flex items-center gap-2 text-text-secondary text-sm mt-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {booking.startTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {booking.startTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        </div>

        <CancelForm cancelToken={token} />
      </div>
    </div>
  );
}
