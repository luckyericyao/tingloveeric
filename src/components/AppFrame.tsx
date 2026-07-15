"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const storyWorld = pathname === "/";
  const cinematicChapter = pathname === "/coordinates";
  const immersive = storyWorld || cinematicChapter;

  useEffect(() => {
    document.body.classList.toggle("immersive-page", storyWorld);
    document.body.classList.toggle("cinematic-page", cinematicChapter);
    return () => {
      document.body.classList.remove("immersive-page");
      document.body.classList.remove("cinematic-page");
    };
  }, [cinematicChapter, storyWorld]);

  if (immersive) return children;

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
