import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { timelineEvents } from "@/data/love";

export const metadata: Metadata = {
  title: "已核实的相遇记录 | Ting 与 Eric",
  description: "只保留有照片、日期或原话支持的相遇与靠近。",
};

export default function StoryPage() {
  return (
    <main className="archive-page">
      <section className="archive-page-hero">
        <div className="content-wrap">
          <Link className="archive-back-link" href="/private">
            <ArrowLeft size={16} />
            回到四个房间
          </Link>
          <p className="archive-kicker">真实记录 · 有照片、有日期、有原话</p>
          <h1>相遇与靠近</h1>
          <p className="archive-lede">
            这里不补写没有发生过的日期，也不替任何人解释感受。只有照片、日期和原话能支持的片段，才进入时间线。
          </p>
        </div>
      </section>

      <section className="archive-timeline-section">
        <div className="content-wrap archive-timeline-list">
          {timelineEvents.map((event, index) => (
            <article className="archive-timeline-entry" key={event.id}>
              <div className="archive-timeline-date">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <time>{event.date}</time>
              </div>
              <div className="archive-timeline-media">
                <Image src={event.image.src} alt={event.image.alt} fill sizes="(max-width: 767px) 92vw, 38vw" />
              </div>
              <div className="archive-timeline-copy">
                <p className="archive-kicker">{event.type} · {event.source === "verified" ? "已核实" : "Eric 的感受"}</p>
                <h2>{event.title}</h2>
                <p>{event.description}</p>
                <span>{event.image.caption}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="archive-reflection-band">
        <div className="content-wrap archive-reflection">
          <p className="archive-kicker">后来 · Eric 的感受</p>
          <h2>我不再试图购买一个结局。</h2>
          <p>
            钱已经归还，旧的金钱关系结束。后来我也重新照顾自己的身体、生活和掌控感。如果未来自然相遇，就作为两个自由的人重新判断；如果没有，也不虚构结局。
          </p>
          <Link className="archive-text-link" href="/him">
            看 Eric 的记录 <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
