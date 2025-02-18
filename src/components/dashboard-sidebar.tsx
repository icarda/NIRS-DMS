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

const links = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Crop Quality Ontology",
    url: "/crop-ontology",
    icon: Leaf,
  },
  {
    title: "Explore Data",
    url: "/explore",
    icon: Database,
  },
  {
    title: "Upload Data",
    url: "/upload",
    icon: FileUp,
  },
  {
    title: "Admin",
    url: "/admin",
    icon: Users,
  },
];

export function AppSidebar() {
  const path = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 text-center font-bold">
        NIRS Quality DBMS
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
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
