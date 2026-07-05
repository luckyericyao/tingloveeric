import type { Metadata } from "next";
import { MemoryImageCard } from "@/components/MemoryImageCard";
import { ProfileSection } from "@/components/ProfileSection";
import { SectionTitle } from "@/components/SectionTitle";
import { ButterflyTrail, RibbonLabel, Sticker } from "@/components/ScrapbookDecor";
import {
  profileHer,
  profileHerImages,
  profileHerSecretCollection,
  profileHerSweetProofs,
} from "@/data/love";

export const metadata: Metadata = {
  title: "Ting，被我认真喜欢的样子 | 我俩",
  description: "我想把她的可爱、脾气、温柔、小表情，和每一次让我心软的瞬间，都好好收起来。",
};

export default function HerPage() {
  return (
    <main>
      <section className="page-band">
        <div className="content-wrap">
          <ProfileSection profile={profileHer} mode="her" images={profileHerImages} />
        </div>
      </section>

      <section className="page-band pt-0">
        <div className="content-wrap">
          <SectionTitle kicker="她可爱的证据" title="她被认真喜欢的每一个瞬间" align="center">
            她不是只被一句“好看”概括的人。她的心软、撒娇、认真和小脾气，都值得被一张张收藏。
          </SectionTitle>
          <div className="sticker-album relative mt-10 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-5">
            <ButterflyTrail className="right-10 top-7" />
            {profileHerSweetProofs.map((item) => (
              <article key={item.title} className="relative">
                <MemoryImageCard image={item.image} />
                <div className="px-3 pt-4">
                  <h2 className="text-lg font-semibold text-[var(--color-ink)]">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-band love-wall bg-[rgba(255,250,244,0.38)]">
        <div className="content-wrap">
          <SectionTitle kicker="我想偷偷收藏的她" title="这些小小的她，我都想记住">
            她被认真看见、被认真喜欢、被认真珍惜。连那些很小很小的表情，也会在我心里发光。
          </SectionTitle>
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {profileHerSecretCollection.map((item) => (
              <div key={item} className="paper-note hover-lift p-5 text-sm leading-7 text-[var(--color-muted)]">
                <RibbonLabel>{item.includes("Ting") ? "专属" : "收藏"}</RibbonLabel>
                <p className="mt-4">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Sticker tone="rose">她的小脾气也可爱</Sticker>
            <Sticker tone="lavender">她一笑我就心软</Sticker>
            <Sticker tone="gold">她值得被坚定选择</Sticker>
          </div>
        </div>
      </section>
    </main>
  );
}
