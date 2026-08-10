import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProfileSection } from "@/components/ProfileSection";
import { profileHer, profileHerImages } from "@/data/love";

export const metadata: Metadata = {
  title: "她与两只猫 | Ting 与 Eric",
  description: "只保存照片、日期和原话能支持的她的生活碎片。",
};

export default function HerPage() {
  return (
    <main className="archive-page">
      <section className="archive-profile-page">
        <div className="content-wrap">
          <Link className="archive-back-link" href="/private">
            <ArrowLeft size={16} />
            回到四个房间
          </Link>
          <ProfileSection profile={profileHer} mode="her" images={profileHerImages} />
          <p className="archive-source-note">
            这页只记录我看见过、保存过的片段。不能确认的地方，保持原样，不把猜测写成她的心情。
          </p>
        </div>
      </section>
    </main>
  );
}
