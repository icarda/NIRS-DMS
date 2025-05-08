"use client";

import { Database, FileUp, Home, Leaf, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserRole } from "@/drizzle/schema";
import { hasPermission } from "@/permissions/general";

export function ClientSidebar({
  isAuthenticated,
  role,
}: {
  isAuthenticated: boolean;
  role: UserRole | undefined;
}) {
  const path = usePathname();

  const links = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      visible: true,
    },
    {
      title: "Crop Quality Ontology",
      url: "/crop-ontology",
      icon: Leaf,
      visible: true,
    },
    {
      title: "Explore Data",
      url: "/explore",
      icon: Database,
      visible: isAuthenticated,
    },
    {
      title: "Upload Data",
      url: "/upload",
      icon: FileUp,
      visible: hasPermission(role, "accessUploadPage"),
    },
    {
      title: "Admin",
      url: "/admin",
      icon: Users,
      visible: hasPermission(role, "accessAdminPages"),
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 text-center font-bold">
        NIRS Quality DBMS
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links
                .filter((item) => item.visible)
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.url === "/"
                          ? path === "/"
                          : path.startsWith(item.url)
                      }
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
