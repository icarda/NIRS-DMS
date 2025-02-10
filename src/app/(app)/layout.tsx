import { AppSidebar } from "@/components/dashboard-sidebar";
import { Header } from "@/components/header";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header title="Dashboard" />
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-2 font-[family-name:var(--font-inter)]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
