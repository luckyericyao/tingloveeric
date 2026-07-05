import type { FrictionRecord } from "@/data/love";

export function FrictionCard({ record }: { record: FrictionRecord }) {
  const rows = [
    ["那天发生了什么", record.whatHappened],
    ["我当时在意什么", record.whatICaredAbout],
    ["你当时在意什么", record.whatYouCaredAbout],
    ["后来我们明白了什么", record.whatWeLearned],
  ];

  return (
    <article className="glass-panel-strong hover-lift p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-[var(--color-ink)]">{record.title}</h3>
        <time className="font-serif-elegant text-sm text-[var(--color-gold)]">
          {record.date}
        </time>
      </div>
      <div className="mt-5 grid gap-3">
        {rows.map(([label, value]) => (
          <section key={label} className="rounded-lg bg-white/52 p-4">
            <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{value}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
