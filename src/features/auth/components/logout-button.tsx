"use client";

import { logout } from "@/features/auth/actions/logout";

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onClick = async () => {
    logout();
  };

  return <span onClick={onClick}>{children}</span>;
};
