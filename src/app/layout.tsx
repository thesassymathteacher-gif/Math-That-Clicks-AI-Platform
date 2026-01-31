import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Math That Clicks",
  description: "CRA-based middle school math practice"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
