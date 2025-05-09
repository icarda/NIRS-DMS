import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import Loader from "@/components/navigation-loader";
import ProgressController from "@/components/progress-controller";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NIRS Quality Database Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Loader />
        <ProgressController />
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
