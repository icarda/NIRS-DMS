import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";
import { db } from "@/drizzle/db";
import { getUserByEmail } from "@/features/users/db/users";
import { UserRole } from "./drizzle/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (token.name && session.user) {
        session.user.name = token.name;
      }
      if (token.center && session.user) {
        session.user.center = token.center as string;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.email) return token;
      const user = await getUserByEmail(token.email);
      if (!user) return token;
      token.role = user.role;
      token.name = `${user.firstName} ${user.lastName}`;
      token.center = user.center.acronym;
      return token;
    },
  },
  ...authConfig,
});
