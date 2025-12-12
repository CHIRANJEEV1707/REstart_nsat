import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/react-query";
import { ComparisonProvider } from "@/context/ComparisonContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "REstart - Discovery & Prep",
  description: "Find your dream college and crack the exams.",
  icons: {
    icon: '/Restart_Logo.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ComparisonProvider>{children}</ComparisonProvider>
        </Providers>
      </body>
    </html>
  );
}
