import Link from "next/link";
import { AchievementCard } from "@/components/AchievementCard";
import { ButterflyDecor } from "@/components/ButterflyDecor";
import { Hero } from "@/components/Hero";
import { NoteCard } from "@/components/NoteCard";
import { PhotoBento } from "@/components/PhotoBento";
import { SectionTitle } from "@/components/SectionTitle";
import { TimelineCard } from "@/components/TimelineCard";
import {
  ButterflyTrail,
  HeartSparkles,
  PawPrint,
  RibbonLabel,
  Sticker,
} from "@/components/ScrapbookDecor";
import {
  achievements,
  boardSeedMessages,
  emotionalZones,
  heroImages,
  homepageHighlights,
  memoryImages,
  navigationCards,
  seedNotes,
  sweetWorldCards,
  timelineEvents,
  worldMapPlaces,
} from "@/data/love";
import type { BoardMessage, WorldMapPlace } from "@/data/love";

function MiniWorldMap({ places }: { places: WorldMapPlace[] }) {
  const previewPlaces = places.slice(0, 3);

  return (
    <div className="relative aspect-[1.75] min-h-64 overflow-hidden rounded-[1.8rem] border border-[rgba(201,169,104,0.22)] bg-[linear-gradient(180deg,rgba(246,250,255,0.88),rgba(255,245,249,0.8))]">
      <svg viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <path d="M95 190C132 112 238 94 314 130C376 159 370 229 330 268C294 303 222 310 164 282C111 257 70 246 95 190Z" fill="rgba(183,197,176,0.42)" />
        <path d="M462 154C528 92 660 102 712 164C762 224 694 284 598 274C504 264 414 206 462 154Z" fill="rgba(200,191,228,0.42)" />
        <path d="M548 304C640 272 732 312 758 382C790 468 676 520 586 474C514 438 478 330 548 304Z" fill="rgba(201,169,104,0.24)" />
        <path d="M754 166C832 120 934 142 956 210C980 284 880 326 796 296C724 270 704 196 754 166Z" fill="rgba(214,154,176,0.25)" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.52),transparent_24rem)]" />
      {previewPlaces.map((place) => {
        const x = ((place.lng + 180) / 360) * 100;
        const y = ((90 - place.lat) / 180) * 100;

        return (
          <span
            key={place.id}
            style={{ left: `${x}%`, top: `${y}%` }}
            className={`map-pin-pulse absolute z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-xs text-white shadow-[0_12px_24px_rgba(67,59,67,0.18)] ${
              place.status === "visited"
                ? "border-[rgba(214,154,176,0.5)] bg-[var(--color-rose)]"
                : "border-[rgba(201,169,104,0.5)] bg-[var(--color-gold)]"
            }`}
          >
            {place.status === "visited" ? "♡" : "✦"}
          </span>
        );
      })}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
        <Sticker tone="rose">我们去过这里</Sticker>
        <Sticker tone="gold">这里以后一起去</Sticker>
      </div>
    </div>
  );
}

function BoardMessagePreview({ message }: { message: BoardMessage }) {
  return (
    <article
      className={`pinned-note rounded-[1.55rem] border p-5 shadow-[0_18px_48px_rgba(126,99,115,0.12)] ${
        message.sender === "Eric"
          ? "border-[rgba(214,154,176,0.26)] bg-[linear-gradient(145deg,rgba(255,252,247,0.96),rgba(255,239,246,0.84))]"
          : "border-[rgba(200,191,228,0.32)] bg-[linear-gradient(145deg,rgba(255,252,247,0.96),rgba(243,239,255,0.82))]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Sticker tone={message.sender === "Eric" ? "rose" : "lavender"}>
          {message.sender} → {message.receiver}
        </Sticker>
        <Sticker tone="gold">{message.mood}</Sticker>
      </div>
      <p className="mt-4 text-sm leading-7 text-[var(--color-ink)]">{message.content}</p>
    </article>
  );
}

export default function Home() {
  return (
    <main>
      <Hero
        eyebrow="Ting 专属恋爱小世界"
        title="我们终于成为彼此的世界。"
        subtitle="这不是模板，是 Eric 给 Ting 做的小世界。蝴蝶、猫咪、小纸条、地图和好多好多喜欢，都放在这里。"
        secondaryLine="想把你的可爱、小脾气、撒娇、心软、想念、和每一次让我舍不得的瞬间，都偷偷收藏起来。"
        images={heroImages}
      />

      <section className="page-band">
        <div className="content-wrap">
          <div className="world-shell p-5 md:p-8">
            <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <HeartSparkles className="left-5 top-5" />
              <ButterflyTrail className="right-8 top-8" />
              <div className="relative">
                <RibbonLabel>只给 Ting</RibbonLabel>
                <h2 className="mt-5 text-3xl font-semibold leading-tight text-[var(--color-ink)] md:text-5xl">
                  给她的小世界
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
                  因为她喜欢蝴蝶，喜欢猫咪，也值得被很认真、很甜地记录下来。
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {homepageHighlights.map((item) => (
                    <div key={item.id} className="pinned-note rounded-[1.4rem] border border-[rgba(201,169,104,0.18)] bg-white/58 p-4">
                      <Sticker tone="rose">{item.label}</Sticker>
                      <p className="mt-4 font-semibold text-[var(--color-ink)]">{item.title}</p>
                      <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative grid gap-4">
                <article className="memory-card p-5 md:p-6">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <RibbonLabel>Ting 专属</RibbonLabel>
                      <h3 className="mt-5 text-2xl font-semibold text-[var(--color-ink)]">
                        她被认真看见。
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                        首页不是功能入口，而是给 Ting 的第一张情书：她喜欢的蝴蝶、猫咪、撒娇、心软和未来，都在这里互相连接。
                      </p>
                    </div>
                    <span className="grid size-14 shrink-0 place-items-center rounded-full border border-[rgba(214,154,176,0.24)] bg-white/72 text-xl text-[var(--color-rose)]">
                      ♡
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Sticker tone="rose">被偏爱</Sticker>
                    <Sticker tone="lavender">偷偷收藏</Sticker>
                    <Sticker tone="gold">今天也喜欢你</Sticker>
                  </div>
                </article>

                <div className="grid gap-4 md:grid-cols-3">
                  {sweetWorldCards.map((card) => (
                    <article key={card.id} className="glass-panel hover-lift relative overflow-hidden p-4">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{card.title}</p>
                      <p className="mt-3 text-xs leading-6 text-[var(--color-muted)]">{card.description}</p>
                      <span className="mt-4 inline-flex text-[var(--color-rose)]">
                        {card.accent === "cat" ? <PawPrint /> : "♡"}
                      </span>
                    </article>
                  ))}
                </div>
              </div>
            </div>
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
        <div className="content-wrap grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="paper-note h-fit p-6">
            <RibbonLabel>今天最想对你说</RibbonLabel>
            <h2 className="mt-5 text-3xl font-semibold text-[var(--color-ink)]">
              今天最想对你说
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
              不是群发的浪漫话，是只想留给 Ting 的一句认真喜欢。
            </p>
            <Link
              href="/board"
              className="tap-bounce mt-6 inline-flex rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium text-[var(--color-ivory)]"
            >
              去留言板写一句
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {boardSeedMessages.slice(0, 2).map((message) => (
              <BoardMessagePreview key={message.id} message={message} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-band pt-0">
        <div className="content-wrap grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="world-shell p-5 md:p-6">
            <MiniWorldMap places={worldMapPlaces} />
          </div>
          <div className="grid content-center gap-5">
            <SectionTitle kicker="下一站的心愿" title="下一站，想和你一起去">
              把已经一起走过的地方，和以后想一起去的地方，都先点亮。
            </SectionTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              {worldMapPlaces.slice(0, 3).map((place) => (
                <div key={place.id} className="glass-panel p-4">
                  <p className="font-semibold text-[var(--color-ink)]">{place.name}</p>
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    {place.status === "visited" ? "我们去过这里" : "这里以后一起去"}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/world"
              className="tap-bounce w-fit rounded-full border border-[color:var(--color-line)] bg-white/70 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-white"
            >
              打开甜蜜世界地图
            </Link>
          </div>
        </div>
      </section>

      <section className="page-band pt-0">
        <div className="content-wrap grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionTitle kicker="小纸条和留言墙" title="你给我，我给你">
            想念、晚安、撒娇、和好，都可以留在这里。小纸条是个人收藏，留言板是我俩互相说话的墙。
          </SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {seedNotes.slice(0, 2).map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
            <Link href="/notes" className="glass-panel hover-lift grid min-h-44 place-items-center p-5 text-center">
              <div>
                <RibbonLabel>睡前想留一句</RibbonLabel>
                <p className="mt-4 text-lg font-semibold text-[var(--color-ink)]">写一张小纸条</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="page-band bg-[rgba(255,250,244,0.34)]">
        <div className="content-wrap">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionTitle kicker="贴纸收藏册" title="心动藏品">
              把我们经历过的爱，收藏成一枚枚小小勋章。
            </SectionTitle>
            <Link
              href="/achievements"
              className="tap-bounce w-fit rounded-full border border-[color:var(--color-line)] bg-white/62 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-white"
            >
              查看全部藏品
            </Link>
          </div>
          <div className="sticker-album grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
            {achievements.slice(-4).map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-band">
        <div className="content-wrap grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative">
            <ButterflyDecor className="right-8 top-2" />
            <SectionTitle kicker="故事书章节" title="相遇以来">
              从第一次靠近，到每一次更懂彼此。这里先露出几页，完整故事都被蝴蝶和小猫温柔收好。
            </SectionTitle>
            <Link
              href="/story"
              className="tap-bounce mt-7 inline-flex rounded-full border border-[color:var(--color-line)] bg-white/62 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-white"
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

      <section className="page-band pt-0">
        <div className="content-wrap">
          <SectionTitle kicker="慢慢翻我们的世界" title="每一页都连着我俩" align="center">
            不是功能清单，而是四个情绪区域：进入小世界、她被偏爱、我俩在发生、未来一起去。
          </SectionTitle>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {emotionalZones.map((zone) => (
              <Link key={zone.id} href={zone.href} className="memory-card hover-lift p-5">
                <Sticker tone={zone.accent === "cat" ? "sage" : zone.accent === "map" ? "gold" : "rose"}>
                  {zone.title}
                </Sticker>
                <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{zone.description}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {navigationCards.map((card) => (
              <Link key={card.href} href={card.href} className="glass-panel hover-lift p-4">
                <p className="font-semibold text-[var(--color-ink)]">{card.title}</p>
                <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
