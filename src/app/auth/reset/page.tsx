import Link from "next/link";

import { ResetForm } from "@/features/auth/components/reset-form";

export default function ResetPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 self-center text-xl font-medium"
        >
          NIRS Quality DBMS
        </Link>
        <ResetForm />
      </div>
    </div>
  );
}
