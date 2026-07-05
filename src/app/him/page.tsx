import type { Metadata } from "next";
import { MemoryImageCard } from "@/components/MemoryImageCard";
import { ProfileSection } from "@/components/ProfileSection";
import { SectionTitle } from "@/components/SectionTitle";
import { PawPrint, RibbonLabel, Sticker } from "@/components/ScrapbookDecor";
import { profileHim, profileHimCuteMoments, profileHimImages } from "@/data/love";

export const metadata: Metadata = {
  title: "Eric，在她眼里慢慢变好的样子 | 我俩",
  description: "他也许不总是会说漂亮话，但他在认真学习怎么更好地爱她。",
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
          <div className="sticker-album mt-10 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-5">
            {profileHimCuteMoments.map((item) => (
              <article key={item.title} className="relative rounded-[1.8rem] bg-white/34 p-3">
                <MemoryImageCard image={item.image} />
                <div className="mt-5 flex items-center gap-2 px-3">
                  <PawPrint />
                  <h2 className="text-xl font-semibold text-[var(--color-ink)]">{item.title}</h2>
                </div>
                <p className="mt-3 px-3 text-sm leading-7 text-[var(--color-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["他想被她夸一下", "他认真靠近的时候", "小猫陪着他慢慢变好"].map((item) => (
              <div key={item} className="paper-note p-5">
                <RibbonLabel>温柔提醒</RibbonLabel>
                <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Sticker tone="sage">软软靠近</Sticker>
            <Sticker tone="gold">慢慢变好</Sticker>
            <Sticker tone="lavender">想被她夸一下</Sticker>
          </div>
        </div>
      </section>
    </main>
  );
}
