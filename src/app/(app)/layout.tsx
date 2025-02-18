import { AppSidebar } from "@/components/dashboard-sidebar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
        <div className="px-0 py-2 font-[family-name:var(--font-inter)] md:px-4">
          {children}
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
