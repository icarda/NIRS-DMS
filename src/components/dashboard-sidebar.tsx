import { auth } from "@/auth";
import { ClientSidebar } from "./client-sidebar";

export async function AppSidebar() {
  const session = await auth();
  const isAuthenticated = !!session;

  return <ClientSidebar isAuthenticated={isAuthenticated} />;
}
