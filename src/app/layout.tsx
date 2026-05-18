import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Mirror — AI Representation Optimizer for Shopify",
  description:
    "See how AI shopping agents are likely to represent your Shopify store, what is missing or risky, and which fixes raise AI Representation Quality fastest.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-ink antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-signal-warn focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#1a1206]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
