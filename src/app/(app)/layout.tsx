import { Suspense } from "react";

import { AppSidebar } from "@/components/dashboard-sidebar";
import { Footer } from "@/components/footer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="max-w-full">
          <div className="py-2 font-[family-name:var(--font-inter)] md:px-4">
            {children}
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}
