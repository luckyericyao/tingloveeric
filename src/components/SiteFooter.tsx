import { coupleInfo } from "@/data/love";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--color-line)] bg-[rgba(255,250,244,0.52)]">
      <div className="content-wrap flex flex-col gap-4 py-10 text-sm text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
        <p>她被认真看见。我俩被认真记录。这段关系被温柔保存。这是我俩的小世界。</p>
        <p className="font-serif-elegant text-[0.76rem] uppercase tracking-normal">
          {coupleInfo.shortLine}
        </p>
      </div>
    </footer>
  );
}
