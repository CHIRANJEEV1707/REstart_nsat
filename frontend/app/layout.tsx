import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/react-query";
import { CompareProvider } from "@/context/CompareContext";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";

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
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <OfflineBanner />
          <Providers>
            <CompareProvider>
              <ToastProvider />
              {children}
            </CompareProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
