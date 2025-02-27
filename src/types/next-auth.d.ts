import NextAuth, { DefaultSession } from "next-auth";

type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  name: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
