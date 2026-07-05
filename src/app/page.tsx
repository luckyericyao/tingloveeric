import Image from "next/image";
import Link from "next/link";
import { AchievementCard } from "@/components/AchievementCard";
import { ButterflyDecor } from "@/components/ButterflyDecor";
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
  heroImages,
  loveSignalCards,
  loveWorldFeatures,
  loveWorldRooms,
  memoryImages,
  photoSlotLabels,
  quickActionCards,
  timelineEvents,
  worldMapPlaces,
} from "@/data/love";
import type {
  BoardMessage,
  LoveSignalCard,
  LoveWorldFeature,
  QuickActionCard,
  RoomCard,
  WorldMapPlace,
} from "@/data/love";
import { getBoardMessages } from "@/lib/boardStore";

function toneClass(tone: "rose" | "lavender" | "gold" | "sage") {
  if (tone === "lavender") {
    return "border-[rgba(200,191,228,0.34)] bg-[rgba(243,239,255,0.68)] text-[var(--color-blue-gray)]";
  }

  if (tone === "gold") {
    return "border-[rgba(201,169,104,0.34)] bg-[rgba(255,244,210,0.68)] text-[var(--color-gold)]";
  }

  if (tone === "sage") {
    return "border-[rgba(183,197,176,0.34)] bg-[rgba(237,244,233,0.7)] text-[var(--color-blue-gray)]";
  }

  return "border-[rgba(214,154,176,0.34)] bg-[rgba(255,239,246,0.72)] text-[var(--color-rose)]";
}

function LoveWorldHero({ latestMessage }: { latestMessage?: BoardMessage }) {
  const mapPlaces = worldMapPlaces.slice(0, 4);

  return (
    <section className="relative overflow-hidden border-b border-[color:var(--color-line)] bg-[radial-gradient(circle_at_80%_20%,rgba(214,154,176,0.28),transparent_28rem),radial-gradient(circle_at_12%_72%,rgba(200,191,228,0.26),transparent_24rem)]">
      <HeartSparkles className="left-[8%] top-[18%]" />
      <ButterflyTrail className="right-[9%] top-[12%]" />
      <div className="content-wrap relative grid min-h-[calc(100svh-4rem)] items-center gap-10 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
        <div className="fade-in max-w-3xl">
          <RibbonLabel>Love World OS</RibbonLabel>
          <h1 className="mt-5 text-5xl font-semibold leading-tight text-[var(--color-ink)] md:text-7xl">
            Ting 的恋爱小世界
          </h1>
          <p className="mt-6 max-w-2xl rounded-[1.4rem] border border-[rgba(214,154,176,0.24)] bg-white/58 px-5 py-4 text-lg font-semibold leading-8 text-[var(--color-ink)] shadow-[0_14px_34px_rgba(126,99,115,0.08)]">
            Ting，这里每一页都是给你的。
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
            想把你的可爱、小脾气、撒娇、心软、想念，和每一次让我舍不得的瞬间，都偷偷收藏起来。
          </p>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-rose)] md:text-lg">
            这里不是模板，是我给你做的一个小世界。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/her"
              className="tap-bounce rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium text-[var(--color-ivory)] shadow-[0_14px_34px_rgba(67,59,67,0.18)] transition hover:bg-[var(--color-blue-gray)]"
            >
              进入我俩的小世界
            </Link>
            <Link
              href="/board"
              className="tap-bounce rounded-full border border-[color:var(--color-line)] bg-white/66 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-white"
            >
              给她留一句话
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            <Sticker tone="rose">Ting 专属</Sticker>
            <Sticker tone="lavender">今天也喜欢你</Sticker>
            <Sticker tone="gold">小猫陪着我们</Sticker>
          </div>
        </div>

        <div className="relative min-h-[640px]">
          <div className="absolute left-[5%] top-6 z-20 rounded-full border border-[rgba(214,154,176,0.24)] bg-white/78 px-4 py-2 text-sm font-semibold text-[var(--color-rose)] shadow-[0_16px_34px_rgba(126,99,115,0.12)]">
            Ting 专属
          </div>
          <div className="absolute right-[6%] top-[10%] z-20 rounded-full border border-[rgba(201,169,104,0.24)] bg-white/78 px-4 py-2 text-sm font-semibold text-[var(--color-gold)] shadow-[0_16px_34px_rgba(126,99,115,0.12)]">
            今天也喜欢你
          </div>

          <div className="world-shell absolute left-1/2 top-14 w-[min(33rem,92vw)] -translate-x-1/2 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--color-muted)]">Love World OS</p>
                <p className="mt-1 text-xl font-semibold text-[var(--color-ink)]">今日小世界</p>
              </div>
              <Sticker tone="rose">For Ting</Sticker>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.08fr_0.92fr]">
              <article className="paper-note p-4">
                <RibbonLabel>mini message</RibbonLabel>
                <p className="mt-4 text-sm font-semibold text-[var(--color-ink)]">
                  {latestMessage ? `${latestMessage.sender} → ${latestMessage.receiver}` : "Eric → Ting"}
                </p>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--color-muted)]">
                  {latestMessage?.content || "今天也想把喜欢留给 Ting。"}
                </p>
              </article>

              <article className="rounded-[1.4rem] border border-[rgba(201,169,104,0.22)] bg-white/62 p-4 shadow-[0_16px_38px_rgba(126,99,115,0.1)]">
                <p className="text-xs text-[var(--color-blue-gray)]">mini map</p>
                <div className="relative mt-3 h-32 overflow-hidden rounded-[1.1rem] bg-[linear-gradient(180deg,rgba(246,250,255,0.88),rgba(255,245,249,0.78))]">
                  <svg viewBox="0 0 500 260" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
                    <path d="M48 86C76 42 146 42 174 78C202 116 148 154 88 134C54 122 32 112 48 86Z" fill="rgba(183,197,176,0.42)" />
                    <path d="M228 70C270 36 342 48 366 90C388 128 338 150 286 138C238 128 196 96 228 70Z" fill="rgba(200,191,228,0.42)" />
                    <path d="M374 86C420 58 470 78 478 114C486 154 430 174 392 148C354 124 344 104 374 86Z" fill="rgba(214,154,176,0.24)" />
                  </svg>
                  {mapPlaces.map((place) => {
                    const x = ((place.lng + 180) / 360) * 100;
                    const y = ((90 - place.lat) / 180) * 100;
                    return (
                      <span
                        key={place.id}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        className={`map-pin-pulse absolute z-10 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[0.65rem] text-white ${
                          place.status === "visited" ? "bg-[var(--color-rose)]" : "bg-[var(--color-gold)]"
                        }`}
                      >
                        {place.status === "visited" ? "♡" : "✦"}
                      </span>
                    );
                  })}
                </div>
              </article>

              <article className="relative overflow-hidden rounded-[1.4rem] border border-[rgba(214,154,176,0.24)] bg-white/64 p-3 shadow-[0_16px_38px_rgba(126,99,115,0.1)]">
                <div className="relative h-44 overflow-hidden rounded-[1.1rem]">
                  <Image
                    src={heroImages[0]?.src || "/images/memory-couple.svg"}
                    alt={heroImages[0]?.alt || "情侣记忆插画"}
                    fill
                    priority
                    sizes="(max-width: 768px) 80vw, 280px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-xs text-[var(--color-muted)]">mini memory card</p>
              </article>

              <article className="grid content-between rounded-[1.4rem] border border-[rgba(201,169,104,0.24)] bg-[linear-gradient(145deg,rgba(255,252,247,0.96),rgba(255,244,210,0.66))] p-4 shadow-[0_16px_38px_rgba(126,99,115,0.1)]">
                <div>
                  <p className="text-xs text-[var(--color-gold)]">mini achievement</p>
                  <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">今天也喜欢你</p>
                </div>
                <div className="mt-5 grid size-20 place-items-center rounded-full border border-[rgba(201,169,104,0.26)] bg-white/74 text-3xl text-[var(--color-rose)]">
                  ♡
                </div>
              </article>
            </div>
          </div>

          <div className="absolute bottom-9 right-4 z-30 grid gap-1 text-[var(--color-blue-gray)]">
            <PawPrint className="opacity-80" />
            <PawPrint className="translate-x-5 scale-75 opacity-60" />
            <PawPrint className="-translate-x-2 scale-90 opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TingWorldFeature({ feature }: { feature: LoveWorldFeature }) {
  return (
    <article className="memory-card hover-lift relative overflow-hidden p-5">
      <div className="absolute -right-7 -top-7 size-24 rounded-full bg-[radial-gradient(circle,rgba(214,154,176,0.18),transparent_68%)]" />
      <div className="relative">
        <RibbonLabel>{feature.label}</RibbonLabel>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-[var(--color-ink)]">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{feature.body}</p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[rgba(214,154,176,0.22)] bg-white/66 text-[var(--color-rose)]">
            {feature.accent === "cat" ? <PawPrint /> : feature.accent === "world" ? "✦" : "♡"}
          </span>
        </div>
      </div>
    </article>
  );
}

function LoveSignalCardView({ card }: { card: LoveSignalCard }) {
  return (
    <Link href={card.href} className={`tap-bounce rounded-[1.6rem] border p-5 shadow-[0_16px_46px_rgba(126,99,115,0.1)] ${toneClass(card.accent)}`}>
      <p className="text-xs font-semibold">{card.detail}</p>
      <h3 className="mt-4 text-xl font-semibold text-[var(--color-ink)]">{card.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{card.body}</p>
    </Link>
  );
}

function QuickActionCardView({ action }: { action: QuickActionCard }) {
  const icon = action.accent === "message" ? "♡" : action.accent === "note" ? "✉" : action.accent === "map" ? "✦" : "✧";

  return (
    <Link href={action.href} className="tap-bounce glass-panel hover-lift group p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-full border border-[rgba(201,169,104,0.22)] bg-white/64 text-lg text-[var(--color-rose)]">
          {icon}
        </span>
        <span className="rounded-full bg-white/62 px-3 py-1 text-xs text-[var(--color-muted)] group-hover:text-[var(--color-ink)]">
          {action.cta}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-[var(--color-ink)]">{action.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{action.body}</p>
    </Link>
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

function BoardPreview({ messages }: { messages: BoardMessage[] }) {
  return (
    <section className="page-band pt-0">
      <div className="content-wrap grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="paper-note h-fit p-6">
          <RibbonLabel>今天最想对你说</RibbonLabel>
          <h2 className="mt-5 text-3xl font-semibold text-[var(--color-ink)]">
            今天最想对你说
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
            你给我，我给你。想念、晚安、撒娇、和好，都留在这里。
          </p>
          <div className="mt-6 rounded-[1.4rem] border border-dashed border-[rgba(214,154,176,0.32)] bg-white/58 p-4 text-sm text-[var(--color-muted)]">
            这句话，想留给 Ting...
          </div>
          <Link
            href="/board"
            className="tap-bounce mt-6 inline-flex rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium text-[var(--color-ivory)]"
          >
            去留言板写一句
          </Link>
        </div>

        <div className="love-wall grid gap-4 rounded-[2rem] border border-[rgba(201,169,104,0.18)] bg-[rgba(255,250,244,0.38)] p-4 md:grid-cols-2">
          {messages.slice(0, 2).map((message) => (
            <BoardMessagePreview key={message.id} message={message} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniWorldMap({ places }: { places: WorldMapPlace[] }) {
  const previewPlaces = places.slice(0, 5);

  return (
    <div className="relative aspect-[1.74] min-h-72 overflow-hidden rounded-[1.8rem] border border-[rgba(201,169,104,0.22)] bg-[linear-gradient(180deg,rgba(246,250,255,0.88),rgba(255,245,249,0.8))]">
      <svg viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <path d="M95 190C132 112 238 94 314 130C376 159 370 229 330 268C294 303 222 310 164 282C111 257 70 246 95 190Z" fill="rgba(183,197,176,0.42)" />
        <path d="M238 332C306 304 382 340 400 406C418 472 342 526 282 496C224 466 176 358 238 332Z" fill="rgba(214,154,176,0.22)" />
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

function WorldMapPreview() {
  const selectedPlace = worldMapPlaces.find((place) => place.status === "wishlist") || worldMapPlaces[0];

  return (
    <section className="page-band pt-0">
      <div className="content-wrap grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="world-shell p-5 md:p-6">
          <MiniWorldMap places={worldMapPlaces} />
        </div>
        <div className="grid content-center gap-5">
          <SectionTitle kicker="下一站的心愿" title="下一站，想和你一起去">
            把已经一起走过的地方，和以后想一起去的地方，都先点亮。
          </SectionTitle>
          {selectedPlace ? (
            <article className="memory-card p-5">
              <RibbonLabel>{selectedPlace.status === "visited" ? "我们去过这里" : "这里以后一起去"}</RibbonLabel>
              <h3 className="mt-5 text-2xl font-semibold text-[var(--color-ink)]">
                {selectedPlace.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                {selectedPlace.wish}
              </p>
              <Sticker tone="gold">把这个地方先偷偷点亮</Sticker>
            </article>
          ) : null}
          <Link
            href="/world"
            className="tap-bounce w-fit rounded-full border border-[color:var(--color-line)] bg-white/70 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-white"
          >
            打开甜蜜世界地图
          </Link>
        </div>
      </div>
    </section>
  );
}

function RoomCardView({ room }: { room: RoomCard }) {
  return (
    <Link href={room.href} className="tap-bounce memory-card hover-lift group relative overflow-hidden p-5">
      <div className="absolute right-5 top-5 text-2xl text-[var(--color-rose)] opacity-45 group-hover:opacity-80">
        {room.accent === "sage" ? <PawPrint /> : room.accent === "gold" ? "✦" : "♡"}
      </div>
      <Sticker tone={room.accent}>{room.sticker}</Sticker>
      <h3 className="mt-5 text-xl font-semibold text-[var(--color-ink)]">{room.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{room.body}</p>
      <p className="mt-5 text-xs text-[var(--color-blue-gray)]">轻轻推开这个房间</p>
    </Link>
  );
}

export default async function Home() {
  const boardMessages = await getBoardMessages().catch(() => boardSeedMessages);
  const previewMessages = boardMessages.length ? boardMessages.slice(0, 2) : boardSeedMessages.slice(0, 2);

  return (
    <main>
      <LoveWorldHero latestMessage={previewMessages[0]} />

      <section className="page-band">
        <div className="content-wrap">
          <div className="world-shell p-5 md:p-8">
            <div className="relative">
              <ButterflyTrail className="right-8 top-8" />
              <SectionTitle kicker="Ting 专属小世界" title="为什么这里是 Ting 的小世界" align="center">
                因为她喜欢蝴蝶，喜欢猫咪，也值得被很认真、很甜地偏爱。
              </SectionTitle>
              <div className="mt-10 grid gap-4 md:grid-cols-2">
                {loveWorldFeatures.map((feature) => (
                  <TingWorldFeature key={feature.id} feature={feature} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-band pt-0">
        <div className="content-wrap">
          <SectionTitle kicker="今日恋爱信号" title="今日恋爱信号" align="center">
            今天也喜欢你，不是随口说说，是认真收藏。
          </SectionTitle>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loveSignalCards.map((card) => (
              <LoveSignalCardView key={card.id} card={card} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-band pt-0">
        <div className="content-wrap">
          <SectionTitle kicker="小世界快捷入口" title="今天可以做什么" align="center">
            不用等纪念日，普通一天也可以被我们甜甜保存。
          </SectionTitle>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActionCards.map((action) => (
              <QuickActionCardView key={action.id} action={action} />
            ))}
          </div>
        </div>
      </section>

      <BoardPreview messages={previewMessages} />

      <WorldMapPreview />

      <section className="page-band pt-0">
        <div className="content-wrap">
          <SectionTitle kicker="Love World OS 的记忆相册" title="被时间偏爱的瞬间" align="center">
            有些照片不只是照片，是那天的风、光、心跳和你。
          </SectionTitle>
          <div className="mx-auto mt-7 flex max-w-4xl flex-wrap justify-center gap-2">
            {photoSlotLabels.map((label) => (
              <Sticker key={label} tone="lavender">{label}</Sticker>
            ))}
          </div>
          <div className="sticker-album mt-10 p-4">
            <PhotoBento images={memoryImages.slice(0, 9)} />
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
          <div className="sticker-album grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-6">
            {achievements.slice(-6).map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-band">
        <div className="content-wrap grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative">
            <ButterflyDecor className="right-8 top-2" />
            <SectionTitle kicker="故事房间预览" title="相遇以来">
              从第一次靠近，到每一次更懂彼此。
            </SectionTitle>
            <Link
              href="/story"
              className="tap-bounce mt-7 inline-flex rounded-full border border-[color:var(--color-line)] bg-white/62 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-white"
            >
              翻开我们的故事
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
          <SectionTitle kicker="私密房间地图" title="进入更多房间" align="center">
            这个小世界里，每个房间都放着我们的一部分。
          </SectionTitle>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loveWorldRooms.map((room) => (
              <RoomCardView key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
