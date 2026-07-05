import type { Metadata } from "next";
import { MemoryImageCard } from "@/components/MemoryImageCard";
import { ProfileSection } from "@/components/ProfileSection";
import { SectionTitle } from "@/components/SectionTitle";
import { PawPrint } from "@/components/ScrapbookDecor";
import { profileHim, profileHimCuteMoments, profileHimImages } from "@/data/love";

export const metadata: Metadata = {
  title: "她眼里的他 | 我俩",
  description: "那些她慢慢看见、也慢慢喜欢的部分。",
};

export default function HimPage() {
  return (
    <main>
      <section className="page-band">
        <div className="content-wrap">
          <ProfileSection profile={profileHim} mode="him" images={profileHimImages} />
        </div>
      </section>

      <section className="page-band pt-0">
        <div className="content-wrap">
          <SectionTitle kicker="小猫陪着他" title="他也在学习怎么更好地爱她" align="center">
            他不总是会说最漂亮的话，但他会用一点点行动，把“我在乎你”慢慢说清楚。
          </SectionTitle>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {profileHimCuteMoments.map((item) => (
              <article key={item.title} className="relative">
                <MemoryImageCard image={item.image} />
                <div className="mt-5 flex items-center gap-2 px-3">
                  <PawPrint />
                  <h2 className="text-xl font-semibold text-[var(--color-ink)]">{item.title}</h2>
                </div>
                <p className="mt-3 px-3 text-sm leading-7 text-[var(--color-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
