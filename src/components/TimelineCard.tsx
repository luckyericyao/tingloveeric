import Image from "next/image";
import type { TimelineEvent } from "@/data/love";

export function TimelineCard({
  event,
  align = "left",
}: {
  event: TimelineEvent;
  align?: "left" | "right";
}) {
  return (
    <article className={`archive-timeline-entry ${align === "right" ? "archive-timeline-entry-reverse" : ""}`}>
      <div className="archive-timeline-media">
        <Image src={event.image.src} alt={event.image.alt} fill sizes="(max-width: 767px) 92vw, 38vw" />
      </div>
      <div className="archive-timeline-copy">
        <p className="archive-kicker">{event.date} · {event.type}</p>
        <h2>{event.title}</h2>
        <p>{event.description}</p>
        <span>{event.image.caption}</span>
      </div>
    </article>
  );
}
