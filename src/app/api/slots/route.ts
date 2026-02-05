import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlotsForEventType } from "@/lib/booking";
import { addDays, startOfDay } from "date-fns";

/**
 * GET /api/slots?eventTypeId=xxx&date=2025-01-15
 * Returns available slots for a given event type on a given date.
 * If no date is provided, returns slots for the next 7 days.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventTypeId = searchParams.get("eventTypeId");
  const dateParam = searchParams.get("date");

  if (!eventTypeId) {
    return NextResponse.json(
      { error: "eventTypeId is required" },
      { status: 400 }
    );
  }

  let dateRangeStart: Date;
  let dateRangeEnd: Date;

  if (dateParam) {
    // Specific date requested — return slots for that day
    dateRangeStart = startOfDay(new Date(dateParam));
    dateRangeEnd = addDays(dateRangeStart, 1);
  } else {
    // Default: next 7 days
    dateRangeStart = new Date();
    dateRangeEnd = addDays(dateRangeStart, 7);
  }

  try {
    const slots = await getAvailableSlotsForEventType(
      eventTypeId,
      dateRangeStart,
      dateRangeEnd
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
