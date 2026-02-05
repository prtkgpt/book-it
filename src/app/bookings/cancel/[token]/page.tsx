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
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="text-xl font-bold mb-4">Booking Already Cancelled</h1>
        <p className="text-gray-600">
          This booking has already been cancelled or rescheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-xl font-bold mb-4">Cancel Booking</h1>
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-medium">{booking.eventType.title}</h2>
        <p className="text-sm text-gray-600">
          with {booking.eventType.user.name}
        </p>
        <p className="text-sm text-gray-500 mt-1">
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
        </p>
      </div>

      <CancelForm cancelToken={token} />
    </div>
  );
}
