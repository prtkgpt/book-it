import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
  Preview,
} from "@react-email/components";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface BookingConfirmationEmailProps {
  recipientName: string;
  otherPartyName: string;
  eventTitle: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  cancelUrl: string;
  rescheduleUrl: string;
  isHost: boolean;
}

export function BookingConfirmationEmail({
  recipientName,
  otherPartyName,
  eventTitle,
  startTime,
  endTime,
  timezone,
  cancelUrl,
  rescheduleUrl,
  isHost,
}: BookingConfirmationEmailProps) {
  const startInTz = toZonedTime(startTime, timezone);
  const endInTz = toZonedTime(endTime, timezone);

  const dateStr = format(startInTz, "EEEE, MMMM d, yyyy");
  const timeStr = `${format(startInTz, "h:mm a")} - ${format(endInTz, "h:mm a")}`;

  const previewText = isHost
    ? `New booking: ${eventTitle} with ${otherPartyName}`
    : `Confirmed: ${eventTitle} with ${otherPartyName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            {isHost ? "New Booking" : "Booking Confirmed"}
          </Heading>

          <Text style={text}>Hi {recipientName},</Text>

          <Text style={text}>
            {isHost
              ? `${otherPartyName} has booked a meeting with you.`
              : `Your meeting with ${otherPartyName} has been confirmed.`}
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>What</Text>
            <Text style={detailValue}>{eventTitle}</Text>

            <Text style={detailLabel}>When</Text>
            <Text style={detailValue}>{dateStr}</Text>
            <Text style={detailValue}>{timeStr} ({timezone})</Text>

            <Text style={detailLabel}>
              {isHost ? "Invitee" : "Host"}
            </Text>
            <Text style={detailValue}>{otherPartyName}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Need to make changes?
          </Text>

          <Section>
            <Link href={rescheduleUrl} style={link}>
              Reschedule
            </Link>
            {" | "}
            <Link href={cancelUrl} style={link}>
              Cancel
            </Link>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Book It - Simple scheduling</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: "#1a1a1a",
  marginBottom: "24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
};

const detailsBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
};

const detailLabel = {
  fontSize: "12px",
  fontWeight: "600" as const,
  color: "#6b7280",
  textTransform: "uppercase" as const,
  marginBottom: "2px",
};

const detailValue = {
  fontSize: "16px",
  color: "#1a1a1a",
  marginTop: "0",
  marginBottom: "12px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const link = {
  color: "#2563eb",
  fontSize: "14px",
  textDecoration: "underline",
};

const footer = {
  fontSize: "12px",
  color: "#9ca3af",
};
