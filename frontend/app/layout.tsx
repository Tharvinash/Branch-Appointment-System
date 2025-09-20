import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import React from "react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Branch Appointment System",
  description: "Toyota Gazoo Racing inspired appointment scheduling system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-white text-black min-h-screen`}
      >
        <div className="min-h-screen bg-white">{children}</div>
      </body>
    </html>
  );
}
