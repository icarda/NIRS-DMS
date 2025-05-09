// components/progress-controller.tsx
"use client";

import { useEffect, useRef } from "react";

import { usePathname } from "next/navigation";
import NProgress from "nprogress";

export default function ProgressController() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      NProgress.done();
    }, 50);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
