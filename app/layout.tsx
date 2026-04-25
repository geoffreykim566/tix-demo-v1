import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tick/ex — tokenized ticket exchange",
  description: "Buy, hold, and resell event tickets on your own wallet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
