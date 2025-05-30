"use client";

import { logout } from "@/features/auth/actions/logout";

export const LogoutButton = ({ children }: { children: React.ReactNode }) => {
  const onClick = async () => {
    logout();
  };

  return <span onClick={onClick}>{children}</span>;
};
