"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { LoveNote } from "@/data/love";

type NoteComposerProps = {
  onAdd: (note: LoveNote) => void;
};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function NoteComposer({ onAdd }: NoteComposerProps) {
  const [author, setAuthor] = useState("Eric");
  const [date, setDate] = useState(todayValue);
  const [mood, setMood] = useState("");
  const [content, setContent] = useState("");

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
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel-strong p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <label htmlFor="note-author" className="text-sm text-[var(--color-muted)]">
          作者
          <input
            id="note-author"
            data-testid="note-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            className="mt-2 w-full rounded-lg border border-[color:var(--color-line)] bg-white/70 px-3 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-rose)]"
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
            className="mt-2 w-full rounded-lg border border-[color:var(--color-line)] bg-white/70 px-3 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-rose)]"
          />
        </label>
        <label htmlFor="note-mood" className="text-sm text-[var(--color-muted)]">
          心情标签
          <input
            id="note-mood"
            data-testid="note-mood"
            value={mood}
            onChange={(event) => setMood(event.target.value)}
            placeholder="例如：想你"
            className="mt-2 w-full rounded-lg border border-[color:var(--color-line)] bg-white/70 px-3 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-rose)]"
          />
        </label>
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
          className="mt-2 w-full resize-none rounded-lg border border-[color:var(--color-line)] bg-white/70 px-3 py-3 leading-7 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-rose)]"
        />
      </label>
      <button
        type="submit"
        data-testid="note-submit"
        style={{ color: "var(--color-ivory)" }}
        className="mt-4 rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium shadow-[0_14px_34px_rgba(67,59,67,0.16)] transition hover:bg-[var(--color-blue-gray)]"
      >
        收进纸条盒
      </button>
    </form>
  );
}
