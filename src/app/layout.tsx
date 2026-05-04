import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nobod.ai",
  description: "nobod.ai — operated by OPCORE Partners AG, Zürich",
  robots: { index: false, follow: false },
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
