import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "./_components/cookie-banner";

export const metadata: Metadata = {
  title: "nobod.ai",
  description: "nobod.ai — operated by OPCORE Partners AG, Steinhausen ZG",
  robots: { index: false, follow: false },
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
