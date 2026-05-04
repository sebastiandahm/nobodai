import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "./_components/cookie-banner";

export const metadata: Metadata = {
  title: "nobod.ai — Let nobody write for you",
  description: "AI-powered LinkedIn ghostwriter. Learns how you think, drafts posts in your voice, you approve in 30 seconds. Operated by OPCORE Partners AG.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="font-sans antialiased min-h-screen">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
