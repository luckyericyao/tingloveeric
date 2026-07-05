import type { Metadata } from "next";
import { ProfileSection } from "@/components/ProfileSection";
import { profileHer } from "@/data/love";

export const metadata: Metadata = {
  title: "他眼里的她 | 我俩",
  description: "那些让我一次次心动的地方。",
};

export default function HerPage() {
  return (
    <main className="page-band">
      <div className="content-wrap">
        <ProfileSection profile={profileHer} mode="her" />
      </div>
    </main>
  );
}
