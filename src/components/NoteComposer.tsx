"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { LoveNote } from "@/data/love";
import { CuteMoodTag, HeartSparkles, PawPrint, RibbonLabel } from "./ScrapbookDecor";

type NoteComposerProps = {
  onAdd: (note: LoveNote) => void;
  moodOptions: string[];
};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function NoteComposer({ onAdd, moodOptions }: NoteComposerProps) {
  const [author, setAuthor] = useState("Eric");
  const [date, setDate] = useState(todayValue);
  const [mood, setMood] = useState(moodOptions[0] ?? "想你");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();

    if (!trimmed) {
      return;
    }

    onAdd({
      id: `local-${Date.now()}`,
      author: author.trim() || "我",
      date,
      mood: mood.trim() || undefined,
      content: trimmed,
    });

    setMood("");
    setContent("");
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel-strong relative overflow-hidden p-6">
      <HeartSparkles className="right-8 top-8" />
      <RibbonLabel>写一张真的小纸条</RibbonLabel>
      <p className="mt-5 text-2xl font-semibold text-[var(--color-ink)]">今天想把哪一句喜欢收好？</p>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
        可以写想你、撒娇、晚安，也可以写一次和好后的心软。这里会像纸条墙一样替我们保存。
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <label htmlFor="note-author" className="text-sm text-[var(--color-muted)]">
          作者
          <input
            id="note-author"
            data-testid="note-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            className="mt-2 w-full rounded-[18px] border border-[color:var(--color-line)] bg-white/70 px-3 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-rose)]"
          />
        </label>
        <label htmlFor="note-date" className="text-sm text-[var(--color-muted)]">
          日期
          <input
            id="note-date"
            data-testid="note-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-[18px] border border-[color:var(--color-line)] bg-white/70 px-3 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-rose)]"
          />
        </label>
        <div className="text-sm text-[var(--color-muted)]">
          心情标签
          <div className="mt-2 flex min-h-[3.2rem] items-center gap-2 rounded-[18px] border border-[color:var(--color-line)] bg-white/70 px-3 py-2 text-[var(--color-ink)]">
            <PawPrint className="scale-75" />
            <span>{mood || "想你"}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {moodOptions.map((option) => (
          <button key={option} type="button" onClick={() => setMood(option)}>
            <CuteMoodTag selected={mood === option}>{option}</CuteMoodTag>
          </button>
        ))}
      </div>
      <label htmlFor="note-content" className="mt-4 block text-sm text-[var(--color-muted)]">
        小纸条
        <textarea
          id="note-content"
          data-testid="note-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={5}
          placeholder="今天也有话想写给你。"
          className="mt-2 w-full resize-none rounded-[22px] border border-[color:var(--color-line)] bg-[rgba(255,252,247,0.82)] px-4 py-4 leading-7 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-rose)]"
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          data-testid="note-submit"
          style={{ color: "var(--color-ivory)" }}
          className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium shadow-[0_14px_34px_rgba(67,59,67,0.16)] transition hover:bg-[var(--color-blue-gray)]"
        >
          收进纸条盒
        </button>
        {saved ? (
          <span className="rounded-full bg-[rgba(214,154,176,0.18)] px-4 py-2 text-sm text-[var(--color-rose)]">
            已经替我们收好啦
          </span>
        ) : null}
      </div>
    </form>
  );
}
