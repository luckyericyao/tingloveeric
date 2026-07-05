import type { ReactNode } from "react";

type Tone = "rose" | "lavender" | "gold" | "sage";

const toneClass: Record<Tone, string> = {
  rose: "border-[rgba(214,154,176,0.32)] bg-[rgba(255,232,241,0.74)] text-[var(--color-ink)]",
  lavender:
    "border-[rgba(200,191,228,0.38)] bg-[rgba(238,234,250,0.74)] text-[var(--color-ink)]",
  gold: "border-[rgba(201,169,104,0.36)] bg-[rgba(255,245,218,0.78)] text-[var(--color-ink)]",
  sage: "border-[rgba(183,197,176,0.38)] bg-[rgba(240,247,237,0.76)] text-[var(--color-ink)]",
};

export function Sticker({
  children,
  tone = "rose",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-[0_10px_24px_rgba(126,99,115,0.10)] ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function CuteMoodTag({
  children,
  selected = false,
}: {
  children: ReactNode;
  selected?: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-2 text-sm transition ${
        selected
          ? "border-[rgba(214,154,176,0.52)] bg-[rgba(214,154,176,0.20)] text-[var(--color-ink)] shadow-[0_12px_28px_rgba(214,154,176,0.16)]"
          : "border-[color:var(--color-line)] bg-white/62 text-[var(--color-muted)]"
      }`}
    >
      {children}
    </span>
  );
}

export function RibbonLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex items-center rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-medium text-[var(--color-ivory)] shadow-[0_14px_30px_rgba(67,59,67,0.16)] ${className}`}
    >
      <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-[var(--color-ink)]" />
      <span className="relative">{children}</span>
    </span>
  );
}

export function ScrapbookTape({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-7 w-24 rotate-[-6deg] rounded-md border border-[rgba(201,169,104,0.18)] bg-[rgba(255,244,210,0.62)] shadow-[0_12px_24px_rgba(126,99,115,0.10)] backdrop-blur ${className}`}
    />
  );
}

export function PawPrint({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-block h-8 w-9 ${className}`}>
      <span className="absolute bottom-0 left-3 h-4 w-5 rounded-full bg-[rgba(140,156,171,0.38)]" />
      <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-[rgba(140,156,171,0.32)]" />
      <span className="absolute left-3 top-0 h-3 w-3 rounded-full bg-[rgba(140,156,171,0.32)]" />
      <span className="absolute right-0 top-2 h-3 w-3 rounded-full bg-[rgba(140,156,171,0.32)]" />
    </span>
  );
}

export function HeartSparkles({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute flex items-center gap-2 text-[var(--color-rose)] ${className}`}
    >
      <span className="text-lg">♡</span>
      <span className="text-xs text-[var(--color-gold)]">✦</span>
      <span className="text-sm text-[var(--color-lavender)]">♡</span>
    </span>
  );
}

export function ButterflyTrail({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-24 w-36 rounded-full border-t border-dashed border-[rgba(201,169,104,0.38)] ${className}`}
    >
      <span className="butterfly-decor small left-2 top-2" />
      <span className="butterfly-decor small gold right-0 top-12" />
    </span>
  );
}
