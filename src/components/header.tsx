"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

interface HeaderProps {
  title: string;
}
export function Header({ title }: HeaderProps) {
  const isMobile = useIsMobile();
  return (
    <header className="flex h-16 items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4 bg-primary" />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-base md:text-sm" asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
        {!isMobile && (
          <Button asChild>
            <Link href="/auth/register">Register</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
