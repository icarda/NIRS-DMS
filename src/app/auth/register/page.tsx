import Link from "next/link";

import { RegisterForm } from "@/features/auth/components/register-form";
import { getCenters } from "@/features/centers/db/center";

export default async function RegisterPage() {
  const centers = await getCenters() 
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 self-center text-xl font-medium"
        >
          NIRS Quality DBMS
        </Link>
        <RegisterForm centers={centers} />
      </div>
    </div>
  );
}
