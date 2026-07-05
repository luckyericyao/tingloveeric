import Link from "next/link";
import type { ReactNode } from "react";
import type { ImageAsset } from "@/data/love";
import { FloatingDecor } from "./FloatingDecor";
import { LovePolaroid } from "./LovePolaroid";
import { ButterflyTrail, HeartSparkles, PawPrint, RibbonLabel, Sticker } from "./ScrapbookDecor";

type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  secondaryLine: string;
  images: ImageAsset[];
  children?: ReactNode;
};

export function Hero({ eyebrow, title, subtitle, secondaryLine, images = [], children }: HeroProps) {
  const collageImages = images.slice(0, 5);

  return (
    <section className="relative overflow-hidden border-b border-[color:var(--color-line)] bg-[radial-gradient(circle_at_78%_20%,rgba(214,154,176,0.28),transparent_28rem),radial-gradient(circle_at_16%_74%,rgba(200,191,228,0.24),transparent_24rem)]">
      <FloatingDecor />
      <HeartSparkles className="left-[9%] top-[20%]" />
      <ButterflyTrail className="right-[8%] top-[15%]" />

      <div className="content-wrap relative grid min-h-[calc(100svh-4rem)] items-center gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
        <div className="fade-in max-w-3xl">
          <p className="font-serif-elegant mb-5 text-sm text-[var(--color-gold)]">
            {eyebrow}
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-[var(--color-ink)] md:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-9 text-[var(--color-muted)] md:text-xl">
            {subtitle}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-rose)] md:text-lg">
            {secondaryLine}
          </p>
          <p className="mt-5 w-fit rounded-full border border-[rgba(214,154,176,0.28)] bg-white/62 px-4 py-2 text-sm font-semibold text-[var(--color-ink)] shadow-[0_14px_34px_rgba(126,99,115,0.08)] md:text-base">
            Ting，这里每一页都是给你的。
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/her"
              style={{ color: "var(--color-ivory)" }}
              className="tap-bounce rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium shadow-[0_14px_34px_rgba(67,59,67,0.18)] transition hover:bg-[var(--color-blue-gray)]"
            >
              看 Ting 被偏爱的样子
            </Link>
            <Link
              href="/board"
              className="tap-bounce rounded-full border border-[color:var(--color-line)] bg-white/66 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-white"
            >
              留一句今天的喜欢
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            <Sticker tone="rose">今日份喜欢</Sticker>
            <Sticker tone="lavender">Ting 专属</Sticker>
            <Sticker tone="gold">小猫陪着我们</Sticker>
          </div>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>

        <div className="relative min-h-[620px] lg:min-h-[700px]">
          <div className="absolute left-[10%] top-0 z-50 rounded-full border border-[rgba(214,154,176,0.22)] bg-white/76 px-4 py-2 text-sm font-semibold text-[var(--color-rose)] shadow-[0_16px_34px_rgba(126,99,115,0.12)]">
            Ting 专属
          </div>
          <div className="absolute right-[9%] top-[18%] z-50 rounded-full border border-[rgba(201,169,104,0.22)] bg-white/76 px-4 py-2 text-sm font-semibold text-[var(--color-gold)] shadow-[0_16px_34px_rgba(126,99,115,0.12)]">
            今天也喜欢你
          </div>
          {collageImages[0] ? (
            <div className="absolute left-4 top-8 z-20 w-[58%] max-w-sm md:left-10">
              <LovePolaroid image={collageImages[0]} rotate="-5deg" priority />
            </div>
          ) : null}
          {collageImages[1] ? (
            <div className="absolute right-2 top-0 z-10 w-[48%] max-w-xs md:right-8">
              <LovePolaroid image={collageImages[1]} rotate="6deg" priority />
            </div>
          ) : null}
          {collageImages[2] ? (
            <div className="absolute bottom-24 left-0 z-30 w-[48%] max-w-xs md:left-6">
              <LovePolaroid image={collageImages[2]} rotate="4deg" />
            </div>
          ) : null}
          {collageImages[3] ? (
            <div className="absolute bottom-10 right-4 z-20 w-[50%] max-w-sm md:right-12">
              <LovePolaroid image={collageImages[3]} rotate="-4deg" />
            </div>
          ) : null}
          {collageImages[4] ? (
            <div className="absolute left-[38%] top-[44%] z-40 hidden w-[34%] max-w-[14rem] md:block">
              <LovePolaroid image={collageImages[4]} rotate="2deg" />
            </div>
          ) : null}
          <div className="paper-note absolute left-[2%] top-[47%] z-50 hidden max-w-[12rem] rotate-[-7deg] p-4 md:block">
            <p className="text-xs text-[var(--color-gold)]">偷偷收藏</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
              她的可爱、小脾气、撒娇和心软，都要被好好记住。
            </p>
          </div>
          <div className="absolute right-[2%] top-[39%] z-50 grid gap-1 text-[var(--color-blue-gray)]">
            <PawPrint className="opacity-80" />
            <PawPrint className="translate-x-5 scale-75 opacity-60" />
            <PawPrint className="-translate-x-2 scale-90 opacity-50" />
          </div>

          <div className="glass-panel-strong absolute bottom-0 left-1/2 z-50 w-[min(22rem,88vw)] -translate-x-1/2 p-5">
            <RibbonLabel>今日份喜欢</RibbonLabel>
            <p className="mt-4 text-xl font-semibold text-[var(--color-ink)]">今天也很喜欢你</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              不是随口说说，是认真收藏。
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-blue-gray)]">
              <PawPrint /> 小猫陪着我们慢慢贴贴
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
