import type { Achievement } from "@/data/love";

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <article className="glass-panel-strong hover-lift relative min-h-48 overflow-hidden p-5">
      <div className="absolute right-4 top-4 h-16 w-16 rounded-full border border-[rgba(201,169,104,0.22)] bg-[radial-gradient(circle,rgba(201,169,104,0.26),transparent_66%)]" />
      <div className="relative">
        <p className="font-serif-elegant text-sm text-[var(--color-gold)]">
          {achievement.rarity}
        </p>
        <h3 className="mt-5 text-2xl font-semibold text-[var(--color-ink)]">
          {achievement.name}
        </h3>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
          {achievement.description}
        </p>
        <span className="soft-chip mt-5 px-3 py-1">
          {achievement.unlocked ? "已收藏" : "慢慢解锁"}
        </span>
      </div>
    </article>
  );
}
