import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nobod.ai — Nobody has time for LinkedIn. Now nobody has to.",
  description:
    "AI-powered LinkedIn ghostwriter. Learns your voice, writes your posts, publishes when you approve. 30 seconds a day.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
