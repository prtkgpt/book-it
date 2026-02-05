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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <p className="text-gray-600">{user.name}</p>
          <h1 className="text-2xl font-bold">{eventType.title}</h1>
          <p className="text-gray-500">{eventType.duration} min</p>
        </div>

        <BookingWidget
          eventTypeId={eventType.id}
          hostTimezone={user.timezone}
          duration={eventType.duration}
        />
      </div>
    </div>
  );
}
