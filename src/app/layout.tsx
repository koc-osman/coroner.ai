import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "dexterme.ai — AI Career Forensics",
  description:
    "Upload your LinkedIn. Find out when AI puts you on the kill table.",
  openGraph: {
    title: "dexterme.ai — AI Career Forensics",
    description:
      "Upload your LinkedIn. Find out when AI puts you on the kill table.",
    siteName: "dexterme.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "dexterme.ai — AI Career Forensics",
    description:
      "Upload your LinkedIn. Find out when AI puts you on the kill table.",
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
