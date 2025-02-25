import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";
import { db } from "@/drizzle/db";
import { getUserByEmail } from "@/features/users/db/users";

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
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.email) return token;
      const user = await getUserByEmail(token.email);
      if (!user) return token;
      token.role = user.role;
      return token;
    },
  },
  ...authConfig,
});
