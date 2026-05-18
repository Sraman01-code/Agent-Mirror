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
        {children}
      </body>
    </html>
  );
}
