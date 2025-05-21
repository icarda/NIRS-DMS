import NextAuth, { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  id: number;
  name: string;
  email: string;
  center: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
