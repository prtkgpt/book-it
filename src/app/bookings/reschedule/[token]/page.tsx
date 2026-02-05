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
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="text-xl font-bold mb-4">Cannot Reschedule</h1>
        <p className="text-gray-600">
          This booking has been cancelled and can no longer be rescheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-xl font-bold mb-2">Reschedule Booking</h1>
        <p className="text-gray-600 mb-6">
          {booking.eventType.title} with {booking.eventType.user.name}
        </p>

        <RescheduleWidget
          rescheduleToken={token}
          eventTypeId={booking.eventTypeId}
          hostTimezone={booking.eventType.user.timezone}
          duration={booking.eventType.duration}
          inviteeName={booking.inviteeName}
          inviteeEmail={booking.inviteeEmail}
        />
      </div>
    </div>
  );
}
