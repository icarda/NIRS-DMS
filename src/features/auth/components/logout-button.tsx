"use client";

import { useRouter } from "next/navigation";
import NProgress from "nprogress";

import { logout } from "@/features/auth/actions/logout";

export const LogoutButton = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const onClick = async () => {
    NProgress.remove();
    NProgress.start();

    try {
      await logout();
      router.refresh();
      setTimeout(() => NProgress.done(), 300);
    } catch (e) {
      NProgress.done();
    }
  };

  return <span onClick={onClick}>{children}</span>;
};
