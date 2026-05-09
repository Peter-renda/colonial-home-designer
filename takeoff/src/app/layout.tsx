import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteCommand — Takeoff",
  description: "Bill of materials calculator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
