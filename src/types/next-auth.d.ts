import NextAuth, { DefaultSession } from "next-auth";

type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  id: string;
  name: string;
  email: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
