"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "./ui/sidebar";

interface HeaderProps {
  title: string;
}
export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/auth/signin" className="py-3">
            Sign In
          </Link>
        </Button>
        <Button asChild>
          <Link href="/auth/register" className="py-3">
            Register
          </Link>
        </Button>
      </div>
    </header>
  );
}
