import Image from "next/image";
import type { TimelineEvent } from "@/data/love";
import { PawPrint, ScrapbookTape, Sticker } from "./ScrapbookDecor";

function eventDecor(type: TimelineEvent["type"]) {
  if (type === "和好" || type === "普通但珍贵的一天") {
    return <PawPrint className="opacity-80" />;
  }

  if (type === "礼物" || type === "纪念日") {
    return <span className="text-lg text-[var(--color-gold)]">✦</span>;
  }

  if (type === "争执") {
    return <span className="text-lg text-[var(--color-blue-gray)]">♡</span>;
  }

  return <span className="text-lg text-[var(--color-lavender)]">✧</span>;
}

export function TimelineCard({
  event,
  align = "left",
}: {
  event: TimelineEvent;
  align?: "left" | "right";
}) {
  return (
    <article
      className={`glass-panel hover-lift relative overflow-hidden p-4 md:w-[calc(50%-2rem)] ${
        align === "right" ? "md:ml-auto" : ""
      }`}
    >
      <ScrapbookTape className="right-8 top-3 z-20 rotate-[7deg]" />
      <div className="relative h-56 overflow-hidden rounded-[24px]">
        <Image
          src={event.image.src}
          alt={event.image.alt}
          fill
          sizes="(max-width: 768px) 90vw, 42vw"
          className="object-cover"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Sticker tone="rose">{event.type}</Sticker>
          <span className="rounded-full bg-white/78 px-3 py-1 text-xs text-[var(--color-muted)] shadow-[0_8px_18px_rgba(126,99,115,0.12)]">
            {event.image.sticker}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-white/78 p-2 shadow-[0_8px_18px_rgba(126,99,115,0.12)]">
          {eventDecor(event.type)}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <time className="font-serif-elegant rounded-full bg-[rgba(255,244,210,0.64)] px-3 py-1 text-sm text-[var(--color-gold)]">
          {event.date}
        </time>
        {event.gallery?.slice(0, 3).map((image) => (
          <span
            key={image.id}
            className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-[0_8px_18px_rgba(126,99,115,0.12)]"
          >
            <Image src={image.src} alt="" fill sizes="40px" className="object-cover" />
          </span>
        ))}
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
