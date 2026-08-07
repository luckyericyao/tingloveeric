import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Film,
  Heart,
  MapPin,
  MessageCircle,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { loveWorldRooms } from "@/data/love";
import { seedNotes, worldMapPlaces } from "@/data/love";
import { ButterflyTrail, HeartSparkles, RibbonLabel, Sticker } from "@/components/ScrapbookDecor";
import { PrivatePulse } from "@/components/PrivatePulse";
import { LockPrivateRoom } from "@/components/LockPrivateRoom";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "私人房间 | Ting & Eric",
  description: "只对 Ting 与 Eric 开放的私人档案馆入口。",
};

const roomIcons = {
  "ting-room": Heart,
  "eric-room": Sparkles,
  "story-room": BookOpen,
  "notes-room": NotebookPen,
  "map-room": MapPin,
  "board-room": MessageCircle,
  "badge-room": Archive,
} as const;

const cinemaRoom = {
  id: "cinema-room",
  title: "电影故事房间",
  body: "轻轻给一个方向，让镜头替我们把这一幕完整讲完。",
  href: "/cinema",
  sticker: "正在播放",
  accent: "lavender" as const,
  icon: Film,
};

export default function PrivatePage() {
  const rooms = [
    ...loveWorldRooms.map((room) => ({ ...room, icon: roomIcons[room.id as keyof typeof roomIcons] || Heart })),
    cinemaRoom,
  ];

  return (
    <main>
      <section className="page-band">
        <div className="content-wrap">
          <SectionTitle kicker="Private archive · 只对两个人开放" title="回到我俩的小世界" align="center">
            今天想把哪一页留给彼此？这里是所有私人房间的入口，不用到处寻找。
          </SectionTitle>

          <section className="world-shell relative mt-10 overflow-hidden p-6 md:p-8">
            <HeartSparkles className="left-8 top-8" />
            <ButterflyTrail className="right-10 top-8" />
            <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <RibbonLabel>今天也可以很轻</RibbonLabel>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight text-[var(--color-ink)] md:text-4xl">
                  一句晚安、一座城市，<br className="hidden md:block" />都值得被认真留下。
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
                  这里的每一扇门都通向一段已经发生过的记忆，或一个还没一起走到的地方。
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:max-w-xs lg:justify-end">
                <Link
                  href="/board"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-4 py-3 text-sm font-medium text-[var(--color-ivory)] transition hover:bg-[var(--color-blue-gray)]"
                >
                  <MessageCircle size={16} />
                  先留一句话
                </Link>
                <Link
                  href="/world"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-white/62 px-4 py-3 text-sm text-[var(--color-ink)] transition hover:bg-white"
                >
                  <MapPin size={16} />
                  点亮一个地方
                </Link>
              </div>
            </div>
          </section>

          <PrivatePulse seedPlaceCount={worldMapPlaces.length} seedNoteCount={seedNotes.length} />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const Icon = room.icon;
              return (
                <Link
                  key={room.id}
                  href={room.href}
                  className="memory-card group relative flex min-h-52 flex-col justify-between p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(126,99,115,0.16)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-full border border-[rgba(214,154,176,0.3)] bg-white/68 text-[var(--color-rose)]">
                      <Icon size={20} strokeWidth={1.6} />
                    </span>
                    <Sticker tone={room.accent}>{room.sticker}</Sticker>
                  </div>
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-[var(--color-ink)]">{room.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{room.body}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--color-rose)]">
                      打开这一页
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-line)] pt-5 text-xs text-[var(--color-muted)]">
            <LockPrivateRoom />
            <div className="flex items-center gap-4">
              <span>只对 Ting 与 Eric 开放。</span>
              <Link href="/" className="inline-flex items-center gap-2 transition hover:text-[var(--color-ink)]">
                <ArrowRight size={14} className="rotate-180" />
                回到公开档案馆
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
