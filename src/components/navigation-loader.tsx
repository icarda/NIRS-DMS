// components/navigation-progress.tsx
"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";
import NProgress from "nprogress";

import "nprogress/nprogress.css";

export default function Loader() {
  const router = useRouter();

  useEffect(() => {
    NProgress.configure({ showSpinner: false, trickleSpeed: 80 });

    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    const originalPush = router.push;
    router.push = (...args) => {
      handleStart();
      return originalPush(...args);
    };

    // When the page becomes visible (hydrated), mark as done
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") handleStop();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      router.push = originalPush;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return null;
}
