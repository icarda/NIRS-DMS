import { getCurrentUser } from "@/lib/currentUser";

async function AuthTest() {
  const user = await getCurrentUser();

  return <div>{JSON.stringify(user, null, 2)}</div>;
}

export default AuthTest;
