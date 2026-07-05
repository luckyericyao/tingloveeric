import type { Metadata } from "next";
import { ProfileSection } from "@/components/ProfileSection";
import { profileHim } from "@/data/love";

export const metadata: Metadata = {
  title: "她眼里的他 | 我俩",
  description: "那些她慢慢看见、也慢慢喜欢的部分。",
};

export default function HimPage() {
  return (
    <main className="page-band">
      <div className="content-wrap">
        <ProfileSection profile={profileHim} mode="him" />
      </div>
    </main>
  );
}
