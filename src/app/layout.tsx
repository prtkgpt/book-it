import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendiq",
  description: "Appointment booking for modern teams"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
