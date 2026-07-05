import type { Achievement } from "@/data/love";
import { PawPrint, RibbonLabel, Sticker } from "./ScrapbookDecor";

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rare = achievement.rarity === "0.1%" || achievement.rarity === "0.5%";

  return (
    <article
      className={`glass-panel-strong hover-lift relative min-h-64 overflow-hidden p-5 ${
        rare ? "shadow-[0_28px_90px_rgba(214,154,176,0.20)]" : ""
      }`}
    >
      <div className="absolute inset-x-8 top-0 h-10 rounded-b-[24px] bg-[rgba(255,244,210,0.48)]" />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(214,154,176,0.26),transparent_68%)]" />
      <div className="absolute bottom-5 right-5 opacity-70">
        <PawPrint />
      </div>
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <Sticker tone={rare ? "rose" : "gold"}>{achievement.rarity}</Sticker>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-[var(--color-blue-gray)]">
            已解锁
          </span>
        </div>
        <div className="mx-auto mt-7 grid h-24 w-24 place-items-center rounded-full border border-[rgba(201,169,104,0.32)] bg-[radial-gradient(circle,rgba(255,255,255,0.96),rgba(248,224,234,0.70))] text-4xl text-[var(--color-rose)] shadow-[inset_0_0_20px_rgba(255,255,255,0.9),0_18px_36px_rgba(126,99,115,0.14)]">
          {achievement.icon ?? "♡"}
        </div>
        <h3 className="mt-6 text-center text-2xl font-semibold text-[var(--color-ink)]">
          {achievement.name}
        </h3>
        <p className="mt-4 text-center text-sm leading-7 text-[var(--color-muted)]">
          {achievement.description}
        </p>
        <div className="mt-5 flex justify-center">
          <RibbonLabel>{achievement.unlocked ? "收藏进心动册" : "慢慢解锁"}</RibbonLabel>
        </div>
      </div>
    </article>
  );
}
