import React from "react";

import { auth } from "@/auth";

async function AuthTest() {
  const session = await auth();

  return <div>{JSON.stringify(session, null, 2)}</div>;
}

export default AuthTest;
