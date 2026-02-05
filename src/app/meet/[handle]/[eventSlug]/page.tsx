import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingWidget } from "./booking-widget";

interface Props {
  params: Promise<{ handle: string; eventSlug: string }>;
}

export default async function PublicBookingPage({ params }: Props) {
  const { handle, eventSlug } = await params;

  const user = await prisma.user.findUnique({
    where: { handle },
    include: {
      eventTypes: {
        where: { slug: eventSlug },
      },
    },
  });

  if (!user || user.eventTypes.length === 0) {
    notFound();
  }

  const eventType = user.eventTypes[0];

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden w-full max-w-4xl">
        <BookingWidget
          eventTypeId={eventType.id}
          hostName={user.name}
          hostTimezone={user.timezone}
          eventTitle={eventType.title}
          duration={eventType.duration}
        />
      </div>
    </div>
  );
}
