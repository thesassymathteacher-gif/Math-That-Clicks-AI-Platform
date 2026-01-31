import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Math That Clicks",
  description: "CRA math lessons for one-step equations"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
