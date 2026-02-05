import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RescheduleWidget } from "./reschedule-widget";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function RescheduleBookingPage({ params }: Props) {
  const { token } = await params;

  const booking = await prisma.booking.findUnique({
    where: { rescheduleToken: token },
    include: { eventType: { include: { user: true } } },
  });

  if (!booking) {
    notFound();
  }

  if (booking.status !== "CONFIRMED") {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-10 text-center max-w-sm">
          <h1 className="text-lg font-bold text-text mb-2">Cannot Reschedule</h1>
          <p className="text-text-secondary text-sm">This booking has been cancelled and can no longer be rescheduled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden w-full max-w-4xl">
        <RescheduleWidget
          rescheduleToken={token}
          eventTypeId={booking.eventTypeId}
          hostName={booking.eventType.user.name}
          hostTimezone={booking.eventType.user.timezone}
          eventTitle={booking.eventType.title}
          duration={booking.eventType.duration}
          inviteeName={booking.inviteeName}
          inviteeEmail={booking.inviteeEmail}
        />
      </div>
    </div>
  );
}
