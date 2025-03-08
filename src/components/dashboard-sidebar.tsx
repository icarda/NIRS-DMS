import { getCurrentUser } from "@/features/auth/actions/currentUser";
import { ClientSidebar } from "./client-sidebar";

export async function AppSidebar() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  return <ClientSidebar isAuthenticated={isAuthenticated} />;
}
