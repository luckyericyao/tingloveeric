import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FloatingDecor } from "./FloatingDecor";

type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  children?: ReactNode;
};

export function Hero({ eyebrow, title, subtitle, imageSrc, children }: HeroProps) {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b border-[color:var(--color-line)]">
      <Image
        src={imageSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.96)_0%,rgba(251,247,240,0.82)_36%,rgba(251,247,240,0.38)_72%,rgba(251,247,240,0.18)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(251,247,240,0.92)_0%,rgba(251,247,240,0.24)_32%,rgba(251,247,240,0.14)_100%)]" />
      <FloatingDecor />

      <div className="content-wrap relative flex min-h-[calc(100svh-4rem)] items-center py-20">
        <div className="fade-in max-w-3xl">
          <p className="font-serif-elegant mb-5 text-sm uppercase text-[var(--color-gold)]">
            {eyebrow}
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-[var(--color-ink)] md:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-9 text-[var(--color-muted)] md:text-xl">
            {subtitle}
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
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
