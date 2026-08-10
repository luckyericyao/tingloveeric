import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProfileSection } from "@/components/ProfileSection";
import { ProfileThemePlayer } from "@/components/ProfileThemePlayer";
import { profileHim, profileHimImages } from "@/data/love";

export const metadata: Metadata = {
  title: "Eric · 后来发生的变化 | Ting 与 Eric",
  description: "一份关于自己的记录，不替她写感受，也不向她索取结局。",
};

export default function HimPage() {
  return (
    <main className="archive-page">
      <section className="archive-profile-page">
        <div className="content-wrap">
          <Link className="archive-back-link" href="/private">
            <ArrowLeft size={16} />
            回到四个房间
          </Link>
          <ProfileSection profile={profileHim} mode="him" images={profileHimImages} />
          <ProfileThemePlayer src="/audio/ymca.m4a" title="Y.M.C.A." artist="Village People" />
        </div>
      </section>
    </main>
  );
}
