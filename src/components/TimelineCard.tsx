import type { TimelineEvent } from "@/data/love";

export function TimelineCard({
  event,
  align = "left",
}: {
  event: TimelineEvent;
  align?: "left" | "right";
}) {
  return (
    <article
      className={`glass-panel hover-lift p-5 md:w-[calc(50%-2rem)] ${
        align === "right" ? "md:ml-auto" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="soft-chip px-3 py-1">{event.type}</span>
        <time className="font-serif-elegant text-sm text-[var(--color-gold)]">
          {event.date}
        </time>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-[var(--color-ink)]">{event.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{event.description}</p>
      {event.imageHint ? (
        <p className="mt-4 border-l-2 border-[var(--color-mist-rose)] pl-3 text-xs leading-6 text-[var(--color-blue-gray)]">
          {event.imageHint}
        </p>
      ) : null}
    </article>
  );
}
