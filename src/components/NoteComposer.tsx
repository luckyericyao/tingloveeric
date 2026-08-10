"use client";

import { useState, type FormEvent } from "react";
import type { LoveNote } from "@/data/love";

type NoteComposerProps = {
  onAdd: (note: LoveNote) => void | Promise<void>;
  moodOptions: string[];
};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function NoteComposer({ onAdd, moodOptions }: NoteComposerProps) {
  const [date, setDate] = useState(todayValue);
  const [mood, setMood] = useState(moodOptions[0] ?? "想念");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError("先写下自己的话。");
      return;
    }

    setError("");
    setSaved(false);
    setIsSaving(true);
    try {
      await onAdd({
        id: `local-${Date.now()}`,
        author: "Eric",
        date,
        mood: mood.trim() || undefined,
        content: trimmed,
        source: "eric-perspective",
      });
      setContent("");
      setSaved(true);
    } catch {
      setError("这句话没有收好，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="archive-note-composer">
      <p className="archive-kicker">留给自己的纸</p>
      <h2>今天想留下什么？</h2>
      <p className="archive-note-intro">
        一件真实发生过的小事，一句没有寄出的想念，或者今天突然想到的画面。
      </p>
      <label className="archive-note-label">
        写下此刻
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={6}
          maxLength={500}
          placeholder="写下一件真实的小事，或者一句只属于自己的话。"
        />
      </label>
      <div className="archive-note-fields">
        <label>
          日期
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label>
          这一刻
          <select value={mood} onChange={(event) => setMood(event.target.value)}>
            {moodOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <div className="archive-note-actions">
        <button type="submit" disabled={isSaving} className="archive-solid-button">
          {isSaving ? "正在保存" : "收进未寄出的信"}
        </button>
        {saved ? <span role="status">已保存为 Eric 的记录。</span> : null}
        {error ? <span role="alert">{error}</span> : null}
      </div>
    </form>
  );
}
