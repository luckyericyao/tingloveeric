import type { Metadata } from "next";
import { SectionTitle } from "@/components/SectionTitle";
import { WorldMapBoard } from "@/components/WorldMapBoard";
import { ButterflyTrail, RibbonLabel, Sticker } from "@/components/ScrapbookDecor";
import { worldMapPlaces } from "@/data/love";

export const metadata: Metadata = {
  title: "甜蜜世界地图 | Ting & Eric",
  description: "把已经一起走过的地方，和以后想一起去的地方，都先点亮在地图上。",
};

export default function WorldPage() {
  return (
    <main>
      <section className="page-band">
        <div className="content-wrap">
          <SectionTitle kicker="旅行梦境板" title="甜蜜世界地图" align="center">
            把已经一起走过的地方，和以后想一起去的地方，都先点亮在地图上。
          </SectionTitle>
          <div className="world-shell relative mt-10 p-6 md:p-8">
            <ButterflyTrail className="right-10 top-8" />
            <div className="relative grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
                <RibbonLabel>旅行梦境板</RibbonLabel>
                <h2 className="mt-4 text-3xl font-semibold text-[var(--color-ink)]">
                  世界很大，但想一起去的人是你。
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Sticker tone="rose">我们去过这里</Sticker>
                <Sticker tone="gold">这里以后一起去</Sticker>
                <Sticker tone="lavender">下一站的心愿</Sticker>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <WorldMapBoard seedPlaces={worldMapPlaces} />
          </div>
        </div>
      </section>
    </main>
  );
}
