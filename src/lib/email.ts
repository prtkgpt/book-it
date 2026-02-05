import { Resend } from "resend";
import { BookingConfirmationEmail } from "@/emails/booking-confirmation";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = "Book It <bookings@updates.bookit.dev>";

interface BookingEmailData {
  hostName: string;
  hostEmail: string;
  inviteeName: string;
  inviteeEmail: string;
  eventTitle: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  cancelUrl: string;
  rescheduleUrl: string;
}

/**
 * Send booking confirmation emails to both the invitee and the host.
 */
export async function sendBookingConfirmationEmails(
  data: BookingEmailData
): Promise<void> {
  const {
    hostName,
    hostEmail,
    inviteeName,
    inviteeEmail,
    eventTitle,
    startTime,
    endTime,
    timezone,
    cancelUrl,
    rescheduleUrl,
  } = data;

  // Send to invitee
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: inviteeEmail,
    subject: `Confirmed: ${eventTitle} with ${hostName}`,
    react: BookingConfirmationEmail({
      recipientName: inviteeName,
      otherPartyName: hostName,
      eventTitle,
      startTime,
      endTime,
      timezone,
      cancelUrl,
      rescheduleUrl,
      isHost: false,
    }),
  });

  // Send to host
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: hostEmail,
    subject: `New booking: ${eventTitle} with ${inviteeName}`,
    react: BookingConfirmationEmail({
      recipientName: hostName,
      otherPartyName: inviteeName,
      eventTitle,
      startTime,
      endTime,
      timezone,
      cancelUrl,
      rescheduleUrl,
      isHost: true,
    }),
  });
}

/**
 * Send cancellation notification emails.
 */
export async function sendCancellationEmails(data: {
  hostName: string;
  hostEmail: string;
  inviteeName: string;
  inviteeEmail: string;
  eventTitle: string;
  startTime: Date;
  timezone: string;
}): Promise<void> {
  const { hostName, hostEmail, inviteeName, inviteeEmail, eventTitle, startTime, timezone } = data;

  const formattedTime = startTime.toLocaleString("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const subject = `Cancelled: ${eventTitle} on ${formattedTime}`;
  const text = `The booking "${eventTitle}" between ${hostName} and ${inviteeName} on ${formattedTime} has been cancelled.`;

  await Promise.all([
    getResend().emails.send({ from: FROM_EMAIL, to: inviteeEmail, subject, text }),
    getResend().emails.send({ from: FROM_EMAIL, to: hostEmail, subject, text }),
  ]);
}
