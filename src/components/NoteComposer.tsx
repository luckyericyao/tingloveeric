"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { LoveNote } from "@/data/love";
import { CuteMoodTag, HeartSparkles, PawPrint, RibbonLabel } from "./ScrapbookDecor";

type NoteComposerProps = {
  onAdd: (note: LoveNote) => void | Promise<void>;
  moodOptions: string[];
};

const quickNotes = [
  { label: "晚安", mood: "晚安", content: "晚安，今天也想把你放在最后一句里。" },
  { label: "想你", mood: "想你", content: "今天路过一个很小的瞬间，第一反应还是想告诉你。" },
  { label: "抱抱", mood: "抱抱", content: "先把一个抱抱留在这里，等你有空的时候再来收。" },
];

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function NoteComposer({ onAdd, moodOptions }: NoteComposerProps) {
  const [author, setAuthor] = useState("Eric");
  const [date, setDate] = useState(todayValue);
  const [mood, setMood] = useState(moodOptions[0] ?? "想你");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();

    if (!trimmed) {
      setError("先写一句小纸条，再把它收起来吧。");
      return;
    }

    setError("");
    setSaved(false);
    setIsSaving(true);
    try {
      await onAdd({
        id: `local-${Date.now()}`,
        author: author.trim() || "我",
        date,
        mood: mood.trim() || undefined,
        content: trimmed,
      });
      setMood(moodOptions[0] ?? "想你");
      setContent("");
      setSaved(true);
    } catch {
      setError("这张纸条没有收好，等一下再试试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel-strong relative overflow-hidden p-6">
      <HeartSparkles className="right-8 top-8" />
      <RibbonLabel>今日份想你</RibbonLabel>
      <p className="mt-5 text-2xl font-semibold text-[var(--color-ink)]">今天想把哪一句喜欢收好？</p>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
        可以写想你、撒娇、晚安，也可以写一次和好后的心软。这里是个人小纸条，不是留言板，会像纸条盒一样替我们保存。
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
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
        <span>轻轻填一句</span>
        {quickNotes.map((note) => (
          <button
            key={note.label}
            type="button"
            data-testid={`note-quick-${note.label}`}
            onClick={() => {
              setMood(note.mood);
              setContent(note.content);
              setSaved(false);
              setError("");
            }}
            className="rounded-full border border-[rgba(214,154,176,0.32)] bg-[rgba(255,247,250,0.72)] px-3 py-2 text-[var(--color-rose)] transition hover:bg-white"
          >
            {note.label}
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
          maxLength={500}
          placeholder="今天也有话想写给你。"
          className="mt-2 w-full resize-none rounded-[22px] border border-[color:var(--color-line)] bg-[rgba(255,252,247,0.82)] px-4 py-4 leading-7 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-rose)]"
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          data-testid="note-submit"
          disabled={isSaving}
          style={{ color: "var(--color-ivory)" }}
          className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium shadow-[0_14px_34px_rgba(67,59,67,0.16)] transition hover:bg-[var(--color-blue-gray)]"
        >
          {isSaving ? "正在收好..." : "收进小世界"}
        </button>
        {saved ? (
          <span className="rounded-full bg-[rgba(214,154,176,0.18)] px-4 py-2 text-sm text-[var(--color-rose)]">
            已经悄悄放进小世界了
          </span>
        ) : null}
        {error ? <span role="alert" className="text-sm text-[var(--color-rose)]">{error}</span> : null}
      </div>
    </form>
  );
}
