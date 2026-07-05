import Link from "next/link";
import { AchievementCard } from "@/components/AchievementCard";
import { ButterflyDecor } from "@/components/ButterflyDecor";
import { Hero } from "@/components/Hero";
import { NoteCard } from "@/components/NoteCard";
import { PhotoBento } from "@/components/PhotoBento";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import { TimelineCard } from "@/components/TimelineCard";
import { ButterflyTrail, HeartSparkles, PawPrint, RibbonLabel } from "@/components/ScrapbookDecor";
import {
  achievements,
  heroImages,
  memoryImages,
  navigationCards,
  seedNotes,
  stats,
  sweetWorldCards,
  timelineEvents,
} from "@/data/love";

export default function Home() {
  return (
    <main>
      <Hero
        eyebrow="甜甜的我俩记录本"
        title="我们终于成为彼此的世界。"
        subtitle="从遇见你的那天起，普通日子也开始闪闪发光。"
        secondaryLine="想把每一次心动、想念、和好、撒娇，都悄悄收藏在这里。"
        images={heroImages}
      />

      <section className="page-band">
        <div className="content-wrap">
          <div className="grid gap-4 md:grid-cols-5">
            {stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-band pt-0">
        <div className="content-wrap">
          <SectionTitle kicker="照片会记得" title="被时间偏爱的瞬间" align="center">
            有些照片不只是照片，是那天的风、光、心跳和你。
          </SectionTitle>
          <div className="mt-10">
            <PhotoBento images={memoryImages.slice(0, 9)} />
          </div>
        </div>
      </section>

      <section className="page-band pt-0">
        <div className="content-wrap">
          <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(201,169,104,0.24)] bg-[linear-gradient(135deg,rgba(255,252,247,0.92),rgba(250,239,247,0.72))] p-6 shadow-[0_28px_80px_rgba(126,99,115,0.12)] md:p-8">
            <HeartSparkles className="left-[6%] top-[10%]" />
            <ButterflyTrail className="right-[9%] top-[12%]" />
            <div className="relative">
              <SectionTitle kicker="只给 Ting" title="给她的小世界" align="center">
                因为她喜欢蝴蝶，喜欢猫咪，也值得被很认真、很甜地记录下来。
              </SectionTitle>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {sweetWorldCards.map((card) => (
                  <article key={card.id} className="memory-card hover-lift relative overflow-hidden p-5">
                    <RibbonLabel>
                      {card.accent === "butterfly" ? "蝴蝶心事" : card.accent === "cat" ? "小猫陪伴" : "认真偏爱"}
                    </RibbonLabel>
                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--color-ink)]">
                          {card.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                          {card.description}
                        </p>
                      </div>
                      <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[rgba(214,154,176,0.24)] bg-white/70 text-[var(--color-rose)]">
                        {card.accent === "cat" ? <PawPrint /> : "♡"}
                      </span>
                    </div>
                    <p className="mt-5 text-xs text-[var(--color-blue-gray)]">
                      {card.image.caption}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-band pt-0">
        <div className="content-wrap grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative">
            <ButterflyDecor className="right-8 top-2" />
            <SectionTitle kicker="我们的故事" title="相遇以来">
              从第一次靠近，到每一次更懂彼此。这里先露出几页，完整故事都被蝴蝶和小猫温柔收好。
            </SectionTitle>
            <Link
              href="/story"
              className="mt-7 inline-flex rounded-full border border-[color:var(--color-line)] bg-white/62 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-white"
            >
              打开完整时间线
            </Link>
          </div>
          <div className="grid gap-4">
            {timelineEvents.slice(0, 3).map((event) => (
              <TimelineCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-band bg-[rgba(255,250,244,0.34)]">
        <div className="content-wrap">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionTitle kicker="心动收藏夹" title="心动藏品">
              把我们经历过的爱，收藏成一枚枚小小勋章。
            </SectionTitle>
            <Link
              href="/achievements"
              className="w-fit rounded-full border border-[color:var(--color-line)] bg-white/62 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-white"
            >
              查看全部藏品
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {achievements.slice(0, 4).map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-band">
        <div className="content-wrap grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <SectionTitle kicker="今日份想你" title="写给你的小纸条">
            那些没有被说得很大声，却一直很认真放在心里的话。想你、心软、贴贴，都先写在这里。
          </SectionTitle>
          <div className="grid gap-4">
            {seedNotes.slice(0, 3).map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-band pt-0">
        <div className="content-wrap">
          <SectionTitle kicker="慢慢翻我们的世界" title="每一页都是我俩" align="center">
            这些入口不是功能清单，而是给这段关系留出的不同抽屉。
          </SectionTitle>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {navigationCards.map((card) => (
              <Link key={card.href} href={card.href} className="glass-panel hover-lift p-5">
                <p className="text-lg font-semibold text-[var(--color-ink)]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
