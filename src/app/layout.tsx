import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteCommand — Design Your Home",
  description: "Interactive home design configurator — Federal, Georgian, and Greek Revival",
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
