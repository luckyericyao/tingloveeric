"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = pathname === "/";

  useEffect(() => {
    document.body.classList.toggle("immersive-page", immersive);
    return () => document.body.classList.remove("immersive-page");
  }, [immersive]);

  if (immersive) return children;

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
