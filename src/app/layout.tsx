import type { Metadata, Viewport } from "next";
import { Dancing_Script } from "next/font/google";

import "./globals.css";

// Section headings only. Self-hosted at build time by next/font, so there is
// no Google request at runtime and no swap flash on the menu.
const script = Dancing_Script({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: "SKY — Menu",
  description: "Menu",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The menu is a reading surface; let guests zoom.
  maximumScale: 5,
  themeColor: "#00778b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={script.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
