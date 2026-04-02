import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "coroner.ai — Career Autopsy by AI",
  description:
    "Upload your LinkedIn screenshot. Find out when AI kills your career.",
  openGraph: {
    title: "coroner.ai — Career Autopsy by AI",
    description:
      "Upload your LinkedIn screenshot. Find out when AI kills your career.",
    siteName: "coroner.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "coroner.ai — Career Autopsy by AI",
    description:
      "Upload your LinkedIn screenshot. Find out when AI kills your career.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
