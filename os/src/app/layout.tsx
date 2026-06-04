import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Delphine Ecosystem OS", template: "%s · Ecosystem OS" },
  description: "Central operations backend for the Delphine ecosystem.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
