"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background">
      <div className="flex flex-col items-center justify-between gap-4 px-16 py-6 md:h-20 md:flex-row md:px-8 md:py-0">
        <Image src="/cgiar-logo.png" alt="CGIAR Logo" width={50} height={20} />
        <p className="flex-1 text-center text-sm text-muted-foreground md:text-left">
          &copy; {currentYear} CGIAR. All rights reserved.
        </p>
        <Link
          href="https://www.cgiar.org"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          About CGIAR
        </Link>
      </div>
    </footer>
  );
}
