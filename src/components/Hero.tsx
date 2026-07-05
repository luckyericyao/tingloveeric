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
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/story"
              style={{ color: "var(--color-ivory)" }}
              className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium shadow-[0_14px_34px_rgba(67,59,67,0.18)] transition hover:bg-[var(--color-blue-gray)]"
            >
              看我们的故事
            </Link>
            <Link
              href="/notes"
              className="rounded-full border border-[color:var(--color-line)] bg-white/66 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-white"
            >
              写一张小纸条
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            <Sticker tone="rose">今日份喜欢</Sticker>
            <Sticker tone="lavender">butterfly kiss</Sticker>
            <Sticker tone="gold">小猫陪着我们</Sticker>
          </div>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>

        <div className="relative min-h-[620px] lg:min-h-[700px]">
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

          <div className="glass-panel-strong absolute bottom-0 left-1/2 z-50 w-[min(22rem,88vw)] -translate-x-1/2 p-5">
            <RibbonLabel>今日份喜欢</RibbonLabel>
            <p className="mt-4 text-xl font-semibold text-[var(--color-ink)]">今天也想偷偷收藏你</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              想把心动、想你、和好、撒娇，都变成小贴纸贴进我俩的本子里。
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
