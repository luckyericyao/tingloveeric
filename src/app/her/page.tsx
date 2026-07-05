import type { Metadata } from "next";
import { MemoryImageCard } from "@/components/MemoryImageCard";
import { ProfileSection } from "@/components/ProfileSection";
import { SectionTitle } from "@/components/SectionTitle";
import {
  profileHer,
  profileHerImages,
  profileHerSecretCollection,
  profileHerSweetProofs,
} from "@/data/love";

export const metadata: Metadata = {
  title: "他眼里的她 | 我俩",
  description: "那些让我一次次心动的地方。",
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
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
              <div key={item} className="paper-note p-5 text-sm leading-7 text-[var(--color-muted)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
