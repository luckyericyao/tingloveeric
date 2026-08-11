"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StoryAudioDirector } from "@/components/StoryAudioDirector";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const archiveHome = pathname === "/";
  const storyWorld = pathname === "/cinema";
  const cinematicChapter = pathname === "/coordinates";
  const immersive = archiveHome || storyWorld || cinematicChapter;

  useEffect(() => {
    document.body.classList.toggle("immersive-page", storyWorld);
    document.body.classList.toggle("cinematic-page", cinematicChapter);
    return () => {
      document.body.classList.remove("immersive-page");
      document.body.classList.remove("cinematic-page");
    };
  }, [cinematicChapter, storyWorld]);

  return (
    <StoryAudioDirector>
      {immersive ? children : (
        <>
          <SiteHeader />
          {children}
          <SiteFooter />
        </>
      )}
    </StoryAudioDirector>
  );
}
