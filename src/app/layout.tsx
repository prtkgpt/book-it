import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book It - Simple Scheduling",
  description: "Share your link, let people book time with you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
