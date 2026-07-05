import type { Metadata } from "next";
import { AchievementCard } from "@/components/AchievementCard";
import { ButterflyDecor } from "@/components/ButterflyDecor";
import { SectionTitle } from "@/components/SectionTitle";
import { RibbonLabel, Sticker } from "@/components/ScrapbookDecor";
import { achievements } from "@/data/love";

export const metadata: Metadata = {
  title: "心动藏品 | 我俩",
  description: "把我们经历过的爱，收藏成一枚枚小小勋章。",
};

export default function AchievementsPage() {
  return (
    <main className="page-band">
      <div className="content-wrap">
        <div className="relative">
          <ButterflyDecor className="left-4 top-0" tone="gold" />
          <ButterflyDecor className="right-6 top-10" size="small" />
          <SectionTitle kicker="心动收藏夹" title="心动藏品" align="center">
            把我们经历过的爱，收藏成一枚枚小小勋章。每一枚都像贴纸一样，证明今天也喜欢你。
          </SectionTitle>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
          <Sticker tone="rose">稀有心动</Sticker>
          <Sticker tone="lavender">蝴蝶心事</Sticker>
          <Sticker tone="gold">小猫陪伴</Sticker>
          <Sticker tone="sage">下一站一起去</Sticker>
        </div>

        <div className="sticker-album mt-12 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="relative">
              <div className="absolute left-5 top-2 z-20">
                <RibbonLabel>{achievement.rarity === "0.1%" ? "稀有闪光" : "已贴好"}</RibbonLabel>
              </div>
              <AchievementCard achievement={achievement} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
