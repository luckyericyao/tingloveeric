import type { StatItem } from "@/data/love";

export function StatCard({ stat }: { stat: StatItem }) {
  return (
    <article className="glass-panel hover-lift min-h-36 p-5">
      <p className="text-sm text-[var(--color-muted)]">{stat.label}</p>
      <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">{stat.value}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{stat.detail}</p>
    </article>
  );
}
