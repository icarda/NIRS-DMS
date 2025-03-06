import { Suspense } from "react";

import { AppSidebar } from "@/components/dashboard-sidebar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="max-w-full">
          <Header title="Dashboard" />
          <div className="py-2 font-[family-name:var(--font-inter)] md:px-4">
            {children}
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}
