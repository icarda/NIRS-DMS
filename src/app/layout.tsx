import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { AppSidebar } from "@/components/dashboard-sidebar";
import { Header } from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header title="Dashboard" />
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-2 font-[family-name:var(--font-inter)]">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
