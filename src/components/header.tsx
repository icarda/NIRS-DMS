import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/actions/currentUser";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { UserAvatar } from "./user-avatar";

interface HeaderProps {
  title: string;
}
export async function Header({ title }: HeaderProps) {
  const user = await getCurrentUser();
  return (
    <header className="flex h-16 items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4 bg-primary" />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <UserAvatar name={user.name} email={user.email} />
        ) : (
          <>
            <Button variant="ghost" className="text-base md:text-sm" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button className="hidden md:inline-flex" asChild>
              <Link href="/auth/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
