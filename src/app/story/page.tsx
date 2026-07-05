import type { Metadata } from "next";
import { ButterflyDecor } from "@/components/ButterflyDecor";
import { FrictionCard } from "@/components/FrictionCard";
import { SectionTitle } from "@/components/SectionTitle";
import { TimelineCard } from "@/components/TimelineCard";
import { RibbonLabel, Sticker } from "@/components/ScrapbookDecor";
import { frictionRecords, timelineEvents } from "@/data/love";

export const metadata: Metadata = {
  title: "相遇以来 | 我俩",
  description: "从第一次靠近，到每一次更懂彼此。",
};

export default function StoryPage() {
  return (
    <main>
      <section className="page-band">
        <div className="content-wrap">
          <div className="relative">
            <ButterflyDecor className="right-4 top-0" />
            <SectionTitle kicker="故事书章节" title="相遇以来" align="center">
              从第一次靠近，到每一次更懂彼此。照片、贴纸、心软和抱抱，都被夹进时间里。
            </SectionTitle>
          </div>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
            <Sticker tone="rose">第一次靠近</Sticker>
            <Sticker tone="lavender">每一次心动</Sticker>
            <Sticker tone="gold">和好以后更喜欢你</Sticker>
          </div>

          <div className="sticker-album relative mt-14 p-4 md:p-6">
            <div className="absolute bottom-0 left-4 top-0 w-px bg-[linear-gradient(var(--color-mist-rose),var(--color-lavender),var(--color-gold))] md:left-1/2" />
            <div className="grid gap-8">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative pl-10 md:pl-0">
                  <span className="absolute left-[0.72rem] top-6 z-10 size-3 rounded-full border border-[var(--color-gold)] bg-white md:left-[calc(50%-0.36rem)]" />
                  <TimelineCard event={event} align={index % 2 === 0 ? "left" : "right"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-band bg-[rgba(255,250,244,0.38)]">
        <div className="content-wrap">
          <SectionTitle
            kicker="不是问题日志"
            title="我们学会更爱彼此的地方"
            align="center"
          >
            这些记录不是为了反复证明谁对谁错，而是为了记住：我们怎样一次次把误会变成更靠近，把难过变成更懂彼此。
          </SectionTitle>
          <div className="mx-auto mt-8 max-w-xl rounded-[1.6rem] border border-[rgba(201,169,104,0.22)] bg-white/58 p-5 text-center">
            <RibbonLabel>爱会学习</RibbonLabel>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
              每一次说清楚、抱回来、再靠近，都是我俩把关系照顾得更好的证据。
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {frictionRecords.map((record) => (
              <FrictionCard key={record.id} record={record} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
