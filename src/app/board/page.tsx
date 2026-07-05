import type { Metadata } from "next";
import { CoupleBoard } from "@/components/CoupleBoard";
import { SectionTitle } from "@/components/SectionTitle";
import { RibbonLabel, Sticker } from "@/components/ScrapbookDecor";

export const metadata: Metadata = {
  title: "我们的留言板 | Ting & Eric",
  description: "你给我，我给你。想说的话、想念的话、晚安、和好、撒娇，都留在这里。",
};

export default function BoardPage() {
  return (
    <main>
      <section className="page-band">
        <div className="content-wrap">
          <SectionTitle kicker="私密留言墙" title="我们的留言板" align="center">
            你给我，我给你。想说的话、想念的话、晚安、和好、撒娇，都留在这里。
          </SectionTitle>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2 rounded-[1.6rem] border border-[rgba(201,169,104,0.2)] bg-white/52 p-4">
            <RibbonLabel>私密留言墙</RibbonLabel>
            <Sticker tone="rose">Eric → Ting</Sticker>
            <Sticker tone="lavender">Ting → Eric</Sticker>
            <Sticker tone="gold">不是公开评论</Sticker>
          </div>
          <div className="mt-10">
            <CoupleBoard />
          </div>
        </div>
      </section>
    </main>
  );
}
